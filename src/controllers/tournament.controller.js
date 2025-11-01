const Tournament = require('../models/tournament.model');
const Chef = require('../models/chef.model');

// --- Crear un nuevo Torneo (POST) ---
const createTournament = async (req, res, next) => {
  try {
    const { name, prize, chefs } = req.body;

    if (!name || !prize) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const newTournament = new Tournament({
      name,
      prize,
      chefs: chefs || [], // Si no se envían chefs, se crea como array vacío
    });
    const savedTournament = await newTournament.save();
    res.status(201).json(savedTournament);
  } catch (err) {
    next(err);
  }
};

// --- Listar todos los Torneos (GET) ---
const listTournaments = async (req, res, next) => {
  try {
    // '.populate()' reemplaza los IDs de los chefs con sus documentos completos
    const tournaments = await Tournament.find().populate('chefs');
    res.status(200).json(tournaments);
  } catch (err) {
    next(err);
  }
};

// --- Añadir un Chef a un Torneo (POST /:id/add-chef) ---
const addChefToTournament = async (req, res, next) => {
  try {
    const { id } = req.params; // ID del torneo
    const { chefId } = req.body; // ID del chef a añadir

    // 1. Encontrar el torneo
    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    // 2. Encontrar el chef
    const chef = await Chef.findById(chefId);
    if (!chef) {
      return res.status(404).json({ message: 'Chef no encontrado' });
    }

    // 3. Añadir el ID del chef al array 'chefs' del torneo (si no está ya)
    if (!tournament.chefs.includes(chefId)) {
      tournament.chefs.push(chefId);
      await tournament.save();
    }
    
    // Devolvemos el torneo actualizado y populado
    const populatedTournament = await Tournament.findById(id).populate('chefs');
    res.status(200).json(populatedTournament);
  } catch (err) {
    next(err);
  }
};

// ---
// --- !! ESTAS SON LAS FUNCIONES QUE FALTABAN !! ---
// ---

// --- Obtener un Torneo por ID (GET /:id) ---
const getTournament = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tournament = await Tournament.findById(id).populate('chefs');

    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    res.status(200).json(tournament);
  } catch (err) {
    next(err);
  }
};

// --- Actualizar un Torneo (PUT /:id) ---
const updateTournament = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedTournament = await Tournament.findByIdAndUpdate(id, req.body, {
      new: true, // Devuelve el documento actualizado
      runValidators: true, // Ejecuta las validaciones del schema
    }).populate('chefs');

    if (!updatedTournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    res.status(200).json(updatedTournament);
  } catch (err) {
    next(err);
  }
};

// --- Eliminar un Torneo (DELETE /:id) ---
const deleteTournament = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedTournament = await Tournament.findByIdAndDelete(id);

    if (!deletedTournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    // 204 No Content es una respuesta común para DELETE exitoso
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};


// --- Exportaciones (Actualizadas para incluir las nuevas funciones) ---
module.exports = {
  createTournament,
  listTournaments,
  addChefToTournament,
  getTournament,     // <--- AÑADIDO
  updateTournament,  // <--- AÑADIDO
  deleteTournament,  // <--- AÑADIDO
};