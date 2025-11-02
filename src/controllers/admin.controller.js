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
    // Obtenemos todos los chefs, pero nunca enviamos la contraseña
  
    const chefs = await Chef.find().select('-password');
    
    // Asegurar que todos los chefs tengan el campo role
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
    
    // Devolvemos el chef actualizado sin la contraseña
    const chefResponse = chef.toObject();
    delete chefResponse.password;
    
    res.json(chefResponse);
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
    // Aquí podrías paginar, pero por ahora traemos todos
    const tournaments = await Tournament.find()
      .populate('participants', 'name specialty')
      .populate({
        path: 'results',
        populate: {
          path: 'chef',
          select: 'name specialty'
        }
      })
      .sort({ createdAt: -1 }); // Más recientes primero
    
    // Formatear las fechas para el frontend
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

// --- ¡¡FUNCIÓN MODIFICADA!! (Solo el bloque CATCH) ---
/**
 * @desc Crea un nuevo torneo
 * @route POST /api/admin/tournaments
 * @access Admin
 */
const createTournament = async (req, res, next) => {
  try {
    const { name, startDate, description, maxParticipants } = req.body;

    if (!name || !startDate || !maxParticipants) {
      return res.status(400).json({ message: 'Nombre, fecha de inicio y participantes máximos son requeridos' });
    }

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
      maxParticipants
    });

    const savedTournament = await newTournament.save();
    
    const tournamentObj = savedTournament.toObject();
    
    if (tournamentObj.inicio) {
       tournamentObj.startDate = new Date(tournamentObj.inicio).toISOString();
       tournamentObj.inicio = tournamentObj.startDate;
    }

    res.status(201).json(tournamentObj); 

  } catch (error) {
    // Imprimir el error en la consola del BACKEND para depurar
    console.error('Error al crear torneo:', error);
    
    // --- ¡¡INICIO DE LA CORRECCIÓN!! ---
    // Manejar error de clave duplicada (E11000)
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
      return res.status(409).json({ // 409 Conflict (en lugar de 500)
        message: `Error: Ya existe un torneo con el nombre "${error.keyValue.name}".`
      });
    }
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    // Si es otro tipo de error, pasarlo al manejador general
    next(error);
    // --- FIN DE LA CORRECCIÓN!! ---
  }
};
// --- FIN DE LA FUNCIÓN MODIFICADA ---


// --- FUNCIONES ADICIONALES PARA GESTIÓN DE USUARIOS ---

/**
 * @desc Cambia el rol de un usuario (solo admin puede hacer esto)
 * @route PUT /api/admin/users/:id/role
 */
const changeUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validar que el ID sea un ObjectId válido
    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: 'ID de usuario inválido' 
      });
    }

    // Validar que el rol sea válido
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ 
        message: 'El rol debe ser "user" o "admin"' 
      });
    }

    // Buscar el usuario
    const user = await Chef.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar el rol
    user.role = role;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: `Rol actualizado correctamente a "${role}"`,
      user: userResponse
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc Lista todos los usuarios (solo admin)
 * @route GET /api/admin/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await Chef.find()
      .select('-password')
      .sort({ createdAt: -1 }); // Más recientes primero

    res.status(200).json({
      count: users.length,
      users
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc Obtiene un usuario específico por ID (solo admin)
 * @route GET /api/admin/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un ObjectId válido
    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: 'ID de usuario inválido' 
      });
    }

    const user = await Chef.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json(user);

  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Funciones originales
  getChefs,
  setChefRole,
  getTournaments,
  deleteTournament,
  createTournament, // Exportada
  // Funciones nuevas
  changeUserRole,
  getAllUsers,
  getUserById
};