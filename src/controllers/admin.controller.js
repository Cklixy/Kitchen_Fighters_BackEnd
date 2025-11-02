// src/controllers/admin.controller.js
const mongoose = require('mongoose');
const Chef = require('../models/chef.model');
const Tournament = require('../models/tournament.model');

// --- GESTIÓN DE CHEFS ---

/**
 * @desc Obtiene todos los chefs
 * @route GET /api/admin/chefs
 * @access Admin
 */
const getChefs = async (req, res, next) => {
  try {
    const chefs = await Chef.find().select('-password');
    const chefsWithRole = chefs.map(chef => {
      const chefObj = chef.toObject();
      if (!chefObj.role) {
        chefObj.role = 'user';
      }
      return chefObj;
    });
    res.status(200).json(chefsWithRole);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Actualiza el rol de un chef
 * @route PUT /api/admin/chefs/:id
 * @access Admin
 */
const setChefRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (role !== 'admin' && role !== 'user') {
      return res.status(400).json({ message: 'Rol inválido. Solo se permite "admin" o "user".' });
    }
    const chef = await Chef.findById(req.params.id);
    if (!chef) {
      return res.status(404).json({ message: 'Chef no encontrado' });
    }
    chef.role = role;
    await chef.save();
    const chefResponse = chef.toObject();
    delete chefResponse.password;
    res.json(chefResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Elimina un chef (usuario)
 * @route DELETE /api/admin/chefs/:id
 * @access Admin
 */
const deleteChef = async (req, res, next) => {
  try {
    const chef = await Chef.findByIdAndDelete(req.params.id);
    if (!chef) {
      return res.status(404).json({ message: 'Chef no encontrado' });
    }
    res.json({ message: `Chef '${chef.name}' eliminado exitosamente`, id: req.params.id });
  } catch (error) {
    next(error);
  }
};


// --- GESTIÓN DE TORNEOS ---

/**
 * @desc Obtiene todos los torneos (para el admin)
 * @route GET /api/admin/tournaments
 * @access Admin
 */
const getTournaments = async (req, res, next) => {
  try {
    const tournaments = await Tournament.find()
      .populate('participants', 'name specialty') 
      .populate({ 
        path: 'results',
        populate: {
          path: 'chef',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });
    
    const tournamentsResponse = tournaments.map(tournament => {
      const tournamentObj = tournament.toObject();
      const dateKey = tournamentObj.startDate ? 'startDate' : 'inicio';
      if (tournamentObj[dateKey]) {
        const dateVal = new Date(tournamentObj[dateKey]).toISOString();
        tournamentObj.startDate = dateVal;
        tournamentObj.inicio = dateVal;
      } else {
        tournamentObj.startDate = null;
        tournamentObj.inicio = null;
      }
      return tournamentObj;
    });
    
    res.status(200).json(tournamentsResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Elimina un torneo
 * @route DELETE /api/admin/tournaments/:id
 * @access Admin
 */
const deleteTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findByIdAndDelete(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }
    res.json({ message: 'Torneo eliminado exitosamente', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Crea un nuevo torneo
 * @route POST /api/admin/tournaments
 * @access Admin
 */
const createTournament = async (req, res, next) => {
  try {
    const { name, startDate, description, maxParticipants, estado } = req.body;
    
    if (!name || !startDate || !maxParticipants) {
      return res.status(400).json({ message: 'Nombre, fecha de inicio y participantes máximos son requeridos' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const parts = startDate.split('-');
    if (parts.length !== 3) {
      return res.status(400).json({ message: 'Formato de fecha inválido. Usar YYYY-MM-DD' });
    }
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const correctedDate = new Date(Date.UTC(year, month, day, 0, 0, 0));
    if (isNaN(correctedDate.getTime())) {
      return res.status(400).json({ message: 'La fecha de inicio proporcionada es inválida.' });
    }

    const newTournament = new Tournament({
      name,
      inicio: correctedDate,
      description,
      maxParticipants,
      imageUrl: imageUrl,
      estado: estado || 'Pendiente' // <-- ¡¡MODIFICADO!!
    });

    const savedTournament = await newTournament.save();
    
    const tournamentObj = savedTournament.toObject();
    if (tournamentObj.inicio) {
       tournamentObj.startDate = new Date(tournamentObj.inicio).toISOString();
       tournamentObj.inicio = tournamentObj.startDate;
    }
    res.status(201).json(tournamentObj);
  } catch (error) {
    console.error('Error al crear torneo:', error);
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
      return res.status(409).json({
        message: `Error: Ya existe un torneo con el nombre "${error.keyValue.name}".`
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

/**
 * @desc Actualiza un torneo (parcialmente)
 * @route PUT /api/admin/tournaments/:id
 * @access Admin
 */
const updateTournament = async (req, res, next) => {
  try {
    const { name, description, startDate, estado } = req.body;
    const updateData = {}; 

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (estado !== undefined) updateData.estado = estado; 

    if (startDate !== undefined) {
      const parts = startDate.split('-');
      if (parts.length !== 3) return res.status(400).json({ message: 'Formato de fecha inválido. Usar YYYY-MM-DD' });
      const year = parseInt(parts[0], 10), month = parseInt(parts[1], 10) - 1, day = parseInt(parts[2], 10);
      const correctedDate = new Date(Date.UTC(year, month, day, 0, 0, 0));
      if (isNaN(correctedDate.getTime())) return res.status(400).json({ message: 'La fecha de inicio proporcionada es inválida.' });
      updateData.inicio = correctedDate;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No se enviaron datos para actualizar.' });
    }

    const updatedTournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      { $set: updateData }, 
      { new: true, runValidators: true } 
    );
    if (!updatedTournament) return res.status(404).json({ message: 'Torneo no encontrado' });

    const tournamentObj = updatedTournament.toObject();
    if (tournamentObj.inicio) {
       tournamentObj.startDate = new Date(tournamentObj.inicio).toISOString();
       tournamentObj.inicio = tournamentObj.startDate;
    }
    res.status(200).json(tournamentObj);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
      return res.status(409).json({ message: `Error: Ya existe un torneo con el nombre "${error.keyValue.name}".` });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

/**
 * @desc Añade o actualiza los resultados de un torneo
 * @route PUT /api/admin/tournaments/:id/results
 * @access Admin
 */
const updateTournamentResults = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { results } = req.body; 

    if (!Array.isArray(results)) {
      return res.status(400).json({ message: 'El campo "results" debe ser un array.' });
    }

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    const participantIds = tournament.participants.map(p => p.toString());
    const validatedResults = [];

    for (const result of results) {
      if (!result.chef || typeof result.score !== 'number') {
        return res.status(400).json({ message: 'Cada resultado debe tener un "chef" (ID) y un "score" (numérico).' });
      }

      if (result.score < 0 || result.score > 100) {
        return res.status(400).json({ message: `La puntuación ${result.score} está fuera del rango (0-100).` });
      }
      
      if (!participantIds.includes(result.chef)) {
         return res.status(400).json({ message: `El chef con ID ${result.chef} no es participante de este torneo.` });
      }

      validatedResults.push({
        chef: result.chef,
        score: result.score
      });
    }

    tournament.results = validatedResults;
    await tournament.save();
    
    const populatedTournament = await Tournament.findById(id)
      .populate('participants', 'name specialty')
      .populate({
        path: 'results',
        populate: {
          path: 'chef',
          select: 'name'
        }
      });

    res.status(200).json(populatedTournament);

  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Error al actualizar resultados:', error);
    next(error);
  }
};


// --- FUNCIONES ADICIONALES (ya existentes) ---
const changeUserRole = async (req, res, next) => { 
  return setChefRole(req, res, next);
};
const getAllUsers = async (req, res, next) => {
  return getChefs(req, res, next);
};
const getUserById = async (req, res, next) => {
  try {
    const chef = await Chef.findById(req.params.id).select('-password');
    if (!chef) {
      return res.status(404).json({ message: 'Chef no encontrado' });
    }
    const chefObj = chef.toObject();
    if (!chefObj.role) {
      chefObj.role = 'user';
    }
    res.status(200).json(chefObj);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChefs,
  setChefRole,
  getTournaments,
  deleteTournament,
  createTournament,
  updateTournament,
  deleteChef,
  changeUserRole,
  getAllUsers,
  getUserById,
  updateTournamentResults
};