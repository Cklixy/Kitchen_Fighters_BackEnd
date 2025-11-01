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
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'Chef'
  }],
  results: [ResultSchema],

  // --- CAMPOS NUEVOS AÑADIDOS ---
  
  /**
   * Fecha y hora de inicio del torneo.
   */
  inicio: {
    type: Date
  },

  /**
   * Estado actual del torneo.
   * - Pendiente: Aún no ha comenzado.
   * - En Curso: Ha comenzado pero no finalizado.
   * - Finalizado: Ya se registraron todos los puntajes.
   * - Cancelado: El torneo fue cancelado.
   */
  estado: {
    type: String,
    enum: ['Pendiente', 'En Curso', 'Finalizado', 'Cancelado'],
    default: 'Pendiente'
  }
  
  // --- FIN DE CAMPOS NUEVOS ---

}, {
  timestamps: true, // Añade createdAt y updatedAt automáticamente
  versionKey: false
});

module.exports = mongoose.model('Tournament', TournamentSchema);