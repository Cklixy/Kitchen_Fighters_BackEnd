// En: src/models/tournament.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Definimos el sub-esquema para los resultados
const ResultSchema = new Schema({
  chef: {
    type: Schema.Types.ObjectId,
    ref: 'Chef',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
}, { _id: false }); // _id: false para no crear IDs para cada resultado

// --- ESQUEMA PRINCIPAL DEL TORNEO ---
const TournamentSchema = new Schema({
  name: {
    type: String,
    required: [true, 'El nombre del torneo es obligatorio'],
    trim: true,
    unique: true
  },

  // --- ¡¡CAMPOS AÑADIDOS!! ---
  description: {
    type: String,
    trim: true,
    default: 'No hay descripción para este torneo.'
  },
  maxParticipants: {
    type: Number,
    min: 2,
    default: 16 // O un valor por defecto que prefieras
  },
  // --- FIN DE CAMPOS AÑADIDOS ---

  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'Chef'
  }],
  results: [ResultSchema],

  /**
   * Fecha y hora de inicio del torneo.
   */
  inicio: {
    type: Date
  },

  /**
   * Estado actual del torneo.
   */
  estado: {
    type: String,
    enum: ['Pendiente', 'En Curso', 'Finalizado', 'Cancelado'],
    default: 'Pendiente'
  }
  
}, {
  timestamps: true, // Añade createdAt y updatedAt automáticamente
  versionKey: false
});

module.exports = mongoose.model('Tournament', TournamentSchema);