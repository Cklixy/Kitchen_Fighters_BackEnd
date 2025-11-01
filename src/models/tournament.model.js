const { Schema, model } = require('mongoose');

const tournamentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    prize: {
      type: Number, // <--- CORREGIDO
      required: true,
    },
    chefs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Chef',
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = model('Tournament', tournamentSchema);