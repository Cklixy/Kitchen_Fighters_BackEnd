const Tournament = require('../models/tournament.model');
const Chef = require('../models/chef.model');

/**
 * @desc Crea un nuevo torneo.
 * @route POST /api/tournaments
 */
const createTournament = async (req, res) => {
  try {
    // Debug: ver qué está llegando
    console.log('req.body type:', typeof req.body);
    console.log('req.body:', req.body);
    console.log('req.headers["content-type"]:', req.headers['content-type']);

    // Validar que req.body existe y es un objeto
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ 
        message: 'El cuerpo de la petición debe ser un objeto JSON válido',
        received: req.body,
        type: typeof req.body
      });
    }

    // Extraemos 'name' y el nuevo campo 'inicio' del body
    const { name, inicio } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'El nombre (name) es obligatorio' });
    }

    // Verificamos si ya existe un torneo con ese nombre
    const existingTournament = await Tournament.findOne({ name });
    if (existingTournament) {
      return res.status(400).json({ message: 'Ya existe un torneo con ese nombre' });
    }

    // Validar y convertir la fecha de inicio si viene
    let fechaInicio = null;
    if (inicio) {
      fechaInicio = new Date(inicio);
      if (isNaN(fechaInicio.getTime())) {
        return res.status(400).json({ message: 'La fecha de inicio no es válida' });
      }
    }

    // Creamos el torneo. 
    // 'estado' se pondrá 'Pendiente' automáticamente gracias al "default" en el modelo.
    const newTournament = new Tournament({
      name,
      inicio: fechaInicio
    });

    const savedTournament = await newTournament.save();
    res.status(201).json(savedTournament);
  } catch (error) {
    console.error('Error al crear torneo:', error);
    // Mejorar el mensaje de error según el tipo
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Error de validación', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Ya existe un torneo con ese nombre' });
    }
    res.status(500).json({ 
      message: 'Error al crear el torneo', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * @desc Obtiene todos los torneos.
 * @route GET /api/tournaments
 */
const getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find().populate('participants', 'name');
    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener torneos', error: error.message });
  }
};

/**
 * @desc Registra un chef en un torneo.
 * @route POST /api/tournaments/:id/register
 */
const registerChef = async (req, res) => {
  try {
    const { id } = req.params;
    const { chefId } = req.body;

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    // Validamos el estado del torneo
    if (tournament.estado !== 'Pendiente') {
      return res.status(400).json({ message: `No se puede registrar chefs. El torneo ya está '${tournament.estado}'` });
    }

    const chef = await Chef.findById(chefId);
    if (!chef) {
      return res.status(404).json({ message: 'Chef no encontrado' });
    }

    // Evitar duplicados
    if (tournament.participants.includes(chefId)) {
      return res.status(400).json({ message: 'El chef ya está registrado en este torneo' });
    }

    tournament.participants.push(chefId);
    await tournament.save();

    res.status(200).json(tournament);
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el chef', error: error.message });
  }
};

/**
 * @desc Envía el puntaje de un chef para un torneo.
 * @route POST /api/tournaments/:id/submit
 */
const submitScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { chefId, score } = req.body;

    if (score === undefined || score === null) {
      return res.status(400).json({ message: 'El puntaje (score) es obligatorio' });
    }

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    // Opcional: Cambiar estado a "En Curso" si es el primer puntaje
    if (tournament.estado === 'Pendiente') {
      tournament.estado = 'En Curso';
    }

    // Validar que el chef esté inscrito
    if (!tournament.participants.some(p => p.equals(chefId))) {
      return res.status(400).json({ message: 'El chef no está registrado en este torneo' });
    }

    // Validar que el chef no haya enviado puntaje aún
    if (tournament.results.some(r => r.chef.equals(chefId))) {
      return res.status(400).json({ message: 'Este chef ya ha enviado su puntaje' });
    }

    tournament.results.push({ chef: chefId, score });
    
    // Opcional: Si todos los participantes enviaron puntaje, finalizar torneo
    if (tournament.results.length === tournament.participants.length) {
      tournament.estado = 'Finalizado';
    }
    
    await tournament.save();
    res.status(200).json(tournament);
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar el puntaje', error: error.message });
  }
};

/**
 * @desc Obtiene el ranking de un torneo.
 * @route GET /api/tournaments/:id/ranking
 */
const getRanking = async (req, res) => {
  try {
    const { id } = req.params;
    const tournament = await Tournament.findById(id).populate('results.chef', 'name');

    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    // Ordenar los resultados por puntaje (descendente)
    const ranking = tournament.results.sort((a, b) => b.score - a.score);

    res.status(200).json(ranking);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el ranking', error: error.message });
  }
};

// Exportamos todas las funciones
module.exports = {
  createTournament,
  getTournaments,
  registerChef,
  submitScore,
  getRanking
};