const { Schema, model } = require('mongoose');

const chefSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    specialty: {
      type: String,
      required: true,
      trim: true,
    },
    experienceYears: {
      type: Number,
      required: true,
      min: [0, 'Experience years must be a positive number'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Chef = model('Chef', chefSchema);
module.exports = Chef;
