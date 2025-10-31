import { Schema, model } from 'mongoose';

// 1. Definimos el Schema del sub-documento "Participant"
// Esto nos permite tener un array de participantes dentro de cada torneo,
// donde cada participante tiene su propia referencia de Chef y su puntaje.
const participantSchema = new Schema(
  {
    chef: {
      type: Schema.Types.ObjectId,
      ref: 'Chef', // Referencia directa al modelo 'Chef'
      required: true,
    },
    score: {
      type: Number,
      min: [0, 'Score must be between 0 and 100'],
      max: [100, 'Score must be between 0 and 100'],
      default: 0, // El puntaje inicial es 0
    },
  },
  {
    _id: false, // No necesitamos un _id separado para cada sub-documento
  }
);

// 2. Definimos el Schema principal del Torneo
const tournamentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    maxChefs: {
      type: Number,
      required: true,
      validate: {
        validator: (v) => v > 0, // Validación para asegurar que sea > 0
        message: 'Maximum chefs must be greater than 0',
      },
    },
    // Usamos el Schema de participante que definimos arriba
    participants: [participantSchema],
  },
  {
    timestamps: true, // Añade createdAt y updatedAt
    versionKey: false, // Desactiva el campo __v
  }
);

// Exportamos el modelo compilado
const Tournament = model('Tournament', tournamentSchema);
export default Tournament;