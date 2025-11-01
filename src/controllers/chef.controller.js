const Chef = require('../models/chef.model');

// --- Crear un nuevo Chef (POST) ---
const createChef = async (req, res, next) => {
  try {
    const { name, specialty, experienceYears } = req.body;
    const newChef = new Chef({
      name,
      specialty,
      experienceYears,
    });
    const savedChef = await newChef.save();
    res.status(201).json(savedChef);
  } catch (err) {
    next(err); // Pasa el error al manejador de errores
  }
};

// --- Listar todos los Chefs (GET) ---
const listChefs = async (req, res, next) => {
  try {
    const chefs = await Chef.find();
    res.status(200).json(chefs);
  } catch (err) {
    next(err);
  }
};

// --- Obtener un Chef por ID (GET /:id) ---
// ESTA ES LA FUNCIÓN QUE FALTABA
const getChef = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Usamos findById para buscar un chef por su ID
    const chef = await Chef.findById(id);

    // Si el chef no existe, devolvemos un 404
    if (!chef) {
      return res.status(404).json({ message: 'Chef no encontrado' });
    }

    // Si se encuentra, se devuelve el chef
    res.status(200).json(chef);
  } catch (err) {
    // Si el ID tiene un formato incorrecto o hay otro error, pasa al manejador de errores
    next(err);
  }
};

// --- Actualizar un Chef (PUT /:id) ---
const updateChef = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedChef = await Chef.findByIdAndUpdate(id, req.body, {
      new: true, // Devuelve el documento actualizado
      runValidators: true, // Ejecuta las validaciones del schema
    });

    if (!updatedChef) {
      return res.status(404).json({ message: 'Chef no encontrado' });
    }

    res.status(200).json(updatedChef);
  } catch (err) {
    next(err);
  }
};

// --- Eliminar un Chef (DELETE /:id) ---
const deleteChef = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedChef = await Chef.findByIdAndDelete(id);

    if (!deletedChef) {
      return res.status(404).json({ message: 'Chef no encontrado' });
    }

    // 204 No Content es una respuesta común para DELETE exitoso
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// --- Exportaciones (CON 'getChef' AÑADIDO) ---
module.exports = {
  createChef,
  listChefs,
  getChef, // <--- AÑADIDO
  updateChef,
  deleteChef,
};