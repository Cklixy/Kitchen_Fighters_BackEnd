const Chef = require('../models/chef.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../config/mailer');

const ensureRole = (chefObj) => {
  if (!chefObj.role) {
    chefObj.role = 'user';
  }
  return chefObj;
};

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

    const chefResponse = ensureRole(chef.toObject());
    delete chefResponse.password;

    res.status(200).json({
      token,
      chef: chefResponse
    });

  } catch (err) {
    next(err);
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    const chef = await Chef.findById(req.chef._id || req.chef.id);
    
    if (!chef) {
      return res.status(404).json({ message: 'Chef no encontrado' });
    }

    const chefResponse = ensureRole(chef.toObject());
    delete chefResponse.password;
    
    res.status(200).json(chefResponse);
  } catch (err) {
    next(err);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const chef = await Chef.findById(req.chef.id);

    if (!chef) {
      return res.status(404).json({ message: 'Chef no encontrado' });
    }

    if (req.body.description) chef.description = req.body.description;
    if (req.body.specialty) chef.specialty = req.body.specialty;
    if (req.body.experienceYears) chef.experienceYears = req.body.experienceYears;

    if (req.file) {
      chef.profileImageUrl = req.file.path.replace(/\\/g, '/');
    }

    const updatedChef = await chef.save();
    const chefResponse = updatedChef.toObject();
    delete chefResponse.password;

    res.status(200).json(chefResponse);

  } catch (err) {
    next(err);
  }
};

const listChefs = async (req, res, next) => {
  try {
    const chefs = await Chef.find().select('-password -email');
    res.status(200).json(chefs);
  } catch (err) {
    next(err);
  }
};

const getChef = async (req, res, next) => {
  try {
    const { id } = req.params;
    const chef = await Chef.findById(id).select('-password');

    if (!chef) {
      return res.status(404).json({ message: 'Chef no encontrado' });
    }

    const chefResponse = ensureRole(chef.toObject());
    res.status(200).json(chefResponse);
  } catch (err) {
    next(err);
  }
};

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

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const chef = await Chef.findOne({ email });

    if (!chef) {
      console.log(`Solicitud de reseteo para email no encontrado: ${email}`);
      return res.status(200).json({ 
        message: 'Si el correo está registrado, recibirás un enlace de reseteo.' 
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');

    chef.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    chef.resetPasswordExpires = Date.now() + 3600000;

    await chef.save();
    console.log(`Token de reseteo generado para: ${chef.email}`);

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = {
      from: `"Kitchen Fighters" <${process.env.EMAIL_USER}>`,
      to: chef.email,
      subject: 'Reseteo de contraseña de Kitchen Fighters',
      html: `
        <p>Hola ${chef.name},</p>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Por favor, haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <a href="${resetUrl}" target="_blank" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste esto, por favor ignora este email.</p>
      `
    };

    await mailer.sendMail(message);
    console.log(`Email de reseteo enviado a: ${chef.email}`);

    res.status(200).json({ 
      message: 'Si el correo está registrado, recibirás un enlace de reseteo.' 
    });

  } catch (err) {
    console.error('Error en forgotPassword:', err);
    try {
      if (req.body.email) {
        const chef = await Chef.findOne({ email: req.body.email });
        if (chef) {
          chef.resetPasswordToken = undefined;
          chef.resetPasswordExpires = undefined;
          await chef.save();
        }
      }
    } catch (saveError) {
      console.error('Error limpiando token después de un error:', saveError);
    }
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password || password.length < 6) {
      return res.status(400).json({ 
        message: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const chef = await Chef.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!chef) {
      return res.status(400).json({ 
        message: 'El enlace de reseteo es inválido o ha expirado.' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    chef.password = hashedPassword;
    chef.resetPasswordToken = undefined;
    chef.resetPasswordExpires = undefined;
    await chef.save();

    console.log(`Contraseña actualizada para: ${chef.email}`);
    res.status(200).json({ 
      message: '¡Contraseña actualizada! Ya puedes iniciar sesión.' 
    });

  } catch (err) {
    console.error('Error en resetPassword:', err);
    next(err);
  }
};

module.exports = {
  createChef,
  loginChef,
  getMyProfile,
  updateMyProfile,
  listChefs,
  getChef,
  updateChef,
  deleteChef,
  forgotPassword,
  resetPassword
};
