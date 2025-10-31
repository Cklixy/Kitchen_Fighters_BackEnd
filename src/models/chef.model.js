import { Schema, model } from 'mongoose';

const chefSchema = new Schema(
  {
    name: {
      type: String,
      required: true, // El nombre es obligatorio
      trim: true, // Limpia espacios en blanco al inicio y final
    },
    specialty: {
      type: String,
      required: true, // La especialidad es obligatoria
      trim: true,
    },
    experienceYears: {
      type: Number,
      required: true, // Los años de experiencia son obligatorios
      min: [0, 'Experience years must be a positive number'], // Validación mínima
    },
  },
  {
    timestamps: true, // Añade createdAt y updatedAt
    versionKey: false, // Desactiva el campo __v
  }
);

// Exportamos el modelo compilado
const Chef = model('Chef', chefSchema);
export default Chef;