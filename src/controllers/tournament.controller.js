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
const registerChef = async (req, res, next) => { // <-- ¡Asegúrate de tener 'next'!
  try {
    const { id } = req.params;
    
    // --- ¡CAMBIO IMPORTANTE! ---
    // Ya no lo leemos del 'body'. Lo leemos del 'req.chef' 
    // que fue añadido por el 'authMiddleware'.
    const chefId = req.chef.id; 
    // --- FIN DEL CAMBIO ---

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    if (tournament.estado !== 'Pendiente') {
      return res.status(400).json({ message: `No se puede registrar chefs. El torneo ya está '${tournament.estado}'` });
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

    // Devolvemos el torneo actualizado y poblado
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

/**
 * @desc Envía el puntaje de un chef para un torneo.
 * @route POST /api/tournaments/:id/submit
 */
const submitScore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { chefId, score } = req.body; // Aquí mantenemos el body, asumiendo que un admin puede poner notas

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
  submitScore,
  getRanking
};