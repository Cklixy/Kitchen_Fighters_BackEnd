// src/controllers/chef.controller.js

const Chef = require('../models/chef.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- Crear un nuevo Chef (POST /) ---
const createChef = async (req, res, next) => {
  try {
    const { name, specialty, experienceYears, email, password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: 'La contraseña es obligatoria y debe tener al menos 6 caracteres',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newChef = new Chef({
      name,
      specialty,
      experienceYears,
      email,
      password: hashedPassword,
    });

    const savedChef = await newChef.save();

    const chefResponse = savedChef.toObject();
    delete chefResponse.password;

    res.status(201).json(chefResponse);
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(409).json({
        message: `El correo electrónico '${err.keyValue.email}' ya está en uso.`,
      });
    }
    next(err);
  }
};

// --- Iniciar Sesión (Login) (POST /login) ---
const loginChef = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor ingrese correo y contraseña' });
    }

    const chef = await Chef.findOne({ email }).select('+password');

    if (!chef) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, chef.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const payload = {
      id: chef._id,
      name: chef.name
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    const chefResponse = chef.toObject();
    delete chefResponse.password;
    
    // Asegurar que el campo role esté presente (usar default si no existe)
    if (!chefResponse.role) {
      chefResponse.role = 'user';
    }

    res.status(200).json({
      token,
      chef: chefResponse
    });

  } catch (err) {
    next(err);
  }
};

// --- Obtener mi perfil actual (GET /me) ---
const getMyProfile = async (req, res, next) => {
  try {
    // Obtener el chef completo desde la BD para asegurar todos los campos
    const chef = await Chef.findById(req.chef._id || req.chef.id);
    
    if (!chef) {
      return res.status(404).json({ message: 'Chef no encontrado' });
    }

    // Asegurar que el campo role esté presente (usar default si no existe)
    const chefResponse = chef.toObject();
    delete chefResponse.password;
    if (!chefResponse.role) {
      chefResponse.role = 'user';
    }
    
    res.status(200).json(chefResponse);
  } catch (err) {
    next(err);
  }
};

// --- ¡NUEVA FUNCIÓN! Actualizar Perfil (PUT /profile) ---
const updateMyProfile = async (req, res, next) => {
  try {
    // 1. Buscamos al chef usando el ID que nuestro 'authMiddleware' puso en 'req.chef'
    const chef = await Chef.findById(req.chef.id);

    if (!chef) {
      return res.status(404).json({ message: 'Chef no encontrado' });
    }

    // 2. Actualizamos los campos que vengan en la petición
    if (req.body.description) {
      chef.description = req.body.description;
    }
    if (req.body.specialty) {
      chef.specialty = req.body.specialty;
    }
    if (req.body.experienceYears) {
      chef.experienceYears = req.body.experienceYears;
    }

    // 3. Si 'multer' procesó un archivo, 'req.file' existirá
    if (req.file) {
      // Guardamos la ruta de la imagen (ej: "uploads/chef-12345.jpg")
      // Reemplazamos '\' por '/' para compatibilidad web
      chef.profileImageUrl = req.file.path.replace(/\\/g, '/');
    }

    const updatedChef = await chef.save();

    // 4. Devolvemos el chef actualizado (sin contraseña)
    const chefResponse = updatedChef.toObject();
    delete chefResponse.password;

    res.status(200).json(chefResponse);

  } catch (err) {
    next(err);
  }
};


// --- Listar todos los Chefs (GET /) ---
const listChefs = async (req, res, next) => {
  try {
    const chefs = await Chef.find().select('-password -email');
    res.status(200).json(chefs);
  } catch (err) {
    next(err);
  }
};

// --- Obtener un Chef por ID (GET /:id) ---
const getChef = async (req, res, next) => {
  try {
    const { id } = req.params;
    const chef = await Chef.findById(id).select('-password');

    if (!chef) {
      return res.status(404).json({ message: 'Chef no encontrado' });
    }

    // Asegurar que el campo role esté presente (usar default si no existe)
    const chefResponse = chef.toObject();
    if (!chefResponse.role) {
      chefResponse.role = 'user';
    }

    res.status(200).json(chefResponse);
  } catch (err) {
    next(err);
  }
};

// --- Actualizar un Chef (PUT /:id) (Esta es para un Admin, la dejamos) ---
const updateChef = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password, ...updates } = req.body;

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          message: 'La contraseña debe tener al menos 6 caracteres',
        });
      }
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    const updatedChef = await Chef.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!updatedChef) {
      return res.status(404).json({ message: 'Chef no encontrado' });
    }

    res.status(200).json(updatedChef);
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(409).json({
        message: `El correo electrónico '${err.keyValue.email}' ya está en uso.`,
      });
    }
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
    
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// --- Exportaciones ---
module.exports = {
  createChef,
  loginChef,
  getMyProfile, // <--- Obtener mi perfil actual
  updateMyProfile,
  listChefs,
  getChef,
  updateChef,
  deleteChef,
};