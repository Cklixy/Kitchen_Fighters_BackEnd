const Tournament = require('../models/tournament.model');
const Chef = require('../models/chef.model');

/**
 * @desc Crea un nuevo torneo.
 * @route POST /api/tournaments
 */
const createTournament = async (req, res) => {
  try {
    // Validar que req.body existe
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ 
        message: 'El cuerpo de la petición debe ser un objeto JSON válido. Asegúrate de que en Postman: 1) Body → raw → JSON, 2) Headers → Content-Type: application/json'
      });
    }

    // Extraemos 'name' y el nuevo campo 'inicio'
    const { name, inicio } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'El nombre (name) es obligatorio' });
    }

    // Validar y convertir la fecha de inicio si viene
    let fechaInicio = null;
    if (inicio) {
      // Si viene como string, intentar convertirla a Date
      if (typeof inicio === 'string') {
        fechaInicio = new Date(inicio);
        // Validar que la fecha sea válida
        if (isNaN(fechaInicio.getTime())) {
          return res.status(400).json({ 
            message: 'La fecha de inicio no es válida. Usa formato ISO (ej: "2024-01-15T10:00:00Z")' 
          });
        }
      } else if (inicio instanceof Date) {
        // Si ya es una fecha, usarla directamente
        fechaInicio = inicio;
      } else {
        return res.status(400).json({ 
          message: 'La fecha de inicio debe ser una fecha válida' 
        });
      }
    }

    // Creamos el torneo. 
    // 'estado' se pondrá 'Pendiente' automáticamente (default en el modelo).
    const newTournament = new Tournament({
      name,
      inicio: fechaInicio
    });

    const savedTournament = await newTournament.save();
    
    // Asegurar que la fecha se devuelva correctamente (null o ISO string)
    const tournamentResponse = savedTournament.toObject();
    if (tournamentResponse.inicio) {
      tournamentResponse.inicio = savedTournament.inicio.toISOString();
    } else {
      tournamentResponse.inicio = null;
    }
    
    res.status(201).json(tournamentResponse);

  } catch (error) {
    
    // --- MANEJO DE ERRORES MEJORADO ---

    // Error 1: Llave Duplicada (Nombre del torneo repetido)
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
      return res.status(409).json({ // 409 Conflict
        message: `El nombre del torneo '${error.keyValue.name}' ya está en uso.`,
        error: 'Duplicate key error (E11000)'
      });
    }

    // Error 2: Error de Validación (ej. fecha inválida o campos faltantes)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ // 400 Bad Request
        message: 'Error de validación. Revisa los campos enviados.',
        // Mongoose entrega detalles de qué campo falló (ej. 'inicio' por el formato)
        errors: error.errors 
      });
    }
    
    // Error 3: Cualquier otra cosa (Error 500)
    console.error('Error inesperado en createTournament:', error); // Loguea el error
    res.status(500).json({ 
      message: 'Error interno del servidor al crear el torneo', 
      error: error.message 
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
    
    // Transformar las fechas a formato ISO para evitar "Invalid Date" en el frontend
    const tournamentsResponse = tournaments.map(tournament => {
      const tournamentObj = tournament.toObject();
      if (tournamentObj.inicio) {
        tournamentObj.inicio = tournament.inicio.toISOString();
      } else {
        tournamentObj.inicio = null;
      }
      return tournamentObj;
    });
    
    res.status(200).json(tournamentsResponse);
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

    // --- LÓGICA DE ESTADO AÑADIDA ---
    if (tournament.estado !== 'Pendiente') {
      return res.status(400).json({ message: `No se puede registrar chefs. El torneo ya está '${tournament.estado}'` });
    }
    // --- FIN DE LÓGICA DE ESTADO ---

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

    // --- LÓGICA DE ESTADO AÑADIDA ---
    // Cambiar estado a "En Curso" si es el primer puntaje
    if (tournament.estado === 'Pendiente') {
      tournament.estado = 'En Curso';
    }
    // --- FIN DE LÓGICA DE ESTADO ---

    // Validar que el chef esté inscrito
    if (!tournament.participants.some(p => p.equals(chefId))) {
      return res.status(400).json({ message: 'El chef no está registrado en este torneo' });
    }

    // Validar que el chef no haya enviado puntaje aún
    if (tournament.results.some(r => r.chef.equals(chefId))) {
      return res.status(400).json({ message: 'Este chef ya ha enviado su puntaje' });
    }

    tournament.results.push({ chef: chefId, score });
    
    // --- LÓGICA DE ESTADO AÑADIDA ---
    // Si todos los participantes enviaron puntaje, finalizar torneo
    if (tournament.results.length === tournament.participants.length && tournament.participants.length > 0) {
      tournament.estado = 'Finalizado';
    }
    // --- FIN DE LÓGICA DE ESTADO ---
    
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