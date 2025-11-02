// En: src/models/chef.model.js

const { Schema, model } = require('mongoose');

const chefSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    specialty: {
      type: String,
      required: [true, 'La especialidad es obligatoria'],
      trim: true,
    },
    experienceYears: {
      type: Number,
      required: [true, 'Los años de experiencia son obligatorios'],
      min: [0, 'Los años de experiencia deben ser un número positivo'],
    },
    email: {
      type: String,
      required: [true, 'El correo es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor ingrese un correo electrónico válido',
      ],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    },
    description: {
      type: String,
      trim: true,
      default: 'Aún no hay descripción. ¡Añade una!'
    },
    profileImageUrl: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      required: false
    },

    // --- ¡¡INICIO DE CÓDIGO AÑADIDO!! ---
    resetPasswordToken: {
      type: String,
      required: false
    },
    resetPasswordExpires: {
      type: Date,
      required: false
    }
    // --- FIN DE CÓDIGO AÑADIDO ---
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Chef = model('Chef', chefSchema);
module.exports = Chef;