const mongoose = require('mongoose');
const Tournament = require('../models/tournament.model');
const Chef = require('../models/chef.model');

/**
 * @desc Crea un nuevo torneo.
 * @route POST /api/tournaments
 */
const createTournament = async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ 
        message: 'El cuerpo de la petición debe ser un objeto JSON válido.'
      });
    }

    const { name, inicio } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'El nombre (name) es obligatorio' });
    }

    let fechaInicio = null;
    if (inicio) {
      fechaInicio = new Date(inicio);
      if (isNaN(fechaInicio.getTime())) {
        return res.status(400).json({ 
          message: 'La fecha de inicio no es válida. Usa formato ISO' 
        });
      }
    }

    const newTournament = new Tournament({
      name,
      inicio: fechaInicio
    });

    const savedTournament = await newTournament.save();
    
    const tournamentResponse = savedTournament.toObject();
    if (tournamentResponse.inicio) {
      tournamentResponse.inicio = savedTournament.inicio.toISOString();
    } else {
      tournamentResponse.inicio = null;
    }
    
    res.status(201).json(tournamentResponse);

  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
      return res.status(409).json({
        message: `El nombre del torneo '${error.keyValue.name}' ya está en uso.`
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Error de validación.',
        errors: error.errors 
      });
    }
    next(error);
  }
};

/**
 * @desc Obtiene todos los torneos.
 * @route GET /api/tournaments
 */
const getTournaments = async (req, res, next) => {
  try {
    const tournaments = await Tournament.find().populate('participants', 'name');
    
    const tournamentsResponse = tournaments.map(tournament => {
      const tournamentObj = tournament.toObject();
      const dateKey = tournamentObj.startDate ? 'startDate' : 'inicio';
      
      if (tournamentObj[dateKey]) {
         tournamentObj[dateKey] = new Date(tournamentObj[dateKey]).toISOString();
      } else {
         tournamentObj[dateKey] = null;
      }
      return tournamentObj;
    });
    
    res.status(200).json(tournamentsResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Obtiene un torneo por ID con detalles.
 * @route GET /api/tournaments/:id
 */
const getTournamentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ 
        message: 'ID de torneo requerido. El ID no puede ser undefined.' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: 'ID de torneo inválido. El formato del ID no es válido.' 
      });
    }

    const tournament = await Tournament.findById(id)
      .populate('participants', 'name specialty')
      .populate({
        path: 'results',
        populate: {
          path: 'chef',
          select: 'name specialty'
        }
      });

    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    const tournamentObj = tournament.toObject();
    const dateKey = tournamentObj.startDate ? 'startDate' : 'inicio';
    if (tournamentObj[dateKey]) {
      tournamentObj[dateKey] = new Date(tournamentObj[dateKey]).toISOString();
    } else {
      tournamentObj[dateKey] = null;
    }
    
    if (tournamentObj.inicio) {
      tournamentObj.startDate = tournamentObj.inicio;
      delete tournamentObj.inicio;
    }

    res.status(200).json(tournamentObj);
  } catch (error) {
    next(error);
  }
};


/**
 * @desc Registra un chef en un torneo.
 * @route POST /api/tournaments/:id/register
 */
const registerChef = async (req, res, next) => { 
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ 
        message: 'ID de torneo requerido. El ID no puede ser undefined.' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: 'ID de torneo inválido. El formato del ID no es válido.' 
      });
    }
    
    const chefId = req.chef.id; 

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    if (tournament.estado !== 'Inscripción') {
      return res.status(400).json({ message: `No se puede registrar. El torneo está en estado '${tournament.estado}', no en 'Inscripción'.` });
    }

    const chef = await Chef.findById(chefId);
    if (!chef) {
      return res.status(404).json({ message: 'Chef no encontrado' });
    }

    if (tournament.participants.some(p => p.equals(chefId))) {
      return res.status(400).json({ message: 'Ya estás inscrito en este torneo' });
    }

    tournament.participants.push(chefId);
    await tournament.save();

    const updatedTournament = await Tournament.findById(id)
      .populate('participants', 'name specialty')
      .populate({
        path: 'results',
        populate: { path: 'chef', select: 'name specialty' }
      });

    res.status(200).json(updatedTournament);
  } catch (error) {
    next(error);
  }
};

// --- NUEVA FUNCIÓN ---
/**
 * @desc Anula la inscripción de un chef en un torneo.
 * @route POST /api/tournaments/:id/unregister
 */
const unregisterChef = async (req, res, next) => {
  try {
    const { id } = req.params; // ID del torneo

    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: 'ID de torneo inválido' 
      });
    }
    
    const chefId = req.chef.id; // ID del chef (viene del authMiddleware)

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    // Solo se puede anular la inscripción si el torneo está en 'Inscripción'
    if (tournament.estado !== 'Inscripción') {
      return res.status(400).json({ 
        message: `No se puede anular la inscripción. El torneo está en estado '${tournament.estado}'.` 
      });
    }

    // Verificar si el chef está realmente inscrito
    if (!tournament.participants.some(p => p.equals(chefId))) {
      return res.status(400).json({ message: 'No estás inscrito en este torneo' });
    }

    // Remover al chef de la lista de participantes
    tournament.participants.pull(chefId);
    await tournament.save();

    // Devolver el torneo actualizado y poblado
    const updatedTournament = await Tournament.findById(id)
      .populate('participants', 'name specialty')
      .populate({
        path: 'results',
        populate: { path: 'chef', select: 'name specialty' }
      });

    res.status(200).json(updatedTournament);
  } catch (error) {
    next(error);
  }
};
// --- FIN DE NUEVA FUNCIÓN ---


/**
 * @desc Envía el puntaje de un chef para un torneo.
 * @route POST /api/tournaments/:id/submit
 */
const submitScore = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ 
        message: 'ID de torneo requerido. El ID no puede ser undefined.' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: 'ID de torneo inválido. El formato del ID no es válido.' 
      });
    }

    const { chefId, score } = req.body; 

    if (score === undefined || score === null) {
      return res.status(400).json({ message: 'El puntaje (score) es obligatorio' });
    }

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    if (tournament.estado === 'Pendiente') {
      tournament.estado = 'En Curso';
    }

    if (!tournament.participants.some(p => p.equals(chefId))) {
      return res.status(400).json({ message: 'El chef no está registrado en este torneo' });
    }

    if (tournament.results.some(r => r.chef.equals(chefId))) {
      return res.status(400).json({ message: 'Este chef ya ha enviado su puntaje' });
    }

    tournament.results.push({ chef: chefId, score });
    
    if (tournament.results.length === tournament.participants.length && tournament.participants.length > 0) {
      tournament.estado = 'Finalizado';
    }
    
    await tournament.save();
    res.status(200).json(tournament);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Obtiene el ranking de un torneo.
 * @route GET /api/tournaments/:id/ranking
 */
const getRanking = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ 
        message: 'ID de torneo requerido. El ID no puede ser undefined.' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: 'ID de torneo inválido. El formato del ID no es válido.' 
      });
    }

    const tournament = await Tournament.findById(id).populate('results.chef', 'name');

    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    const ranking = tournament.results.sort((a, b) => b.score - a.score);

    res.status(200).json(ranking);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTournament,
  getTournaments,
  getTournamentById,
  registerChef,
  unregisterChef, // <-- Asegúrate de exportar la nueva función
  submitScore,
  getRanking
};