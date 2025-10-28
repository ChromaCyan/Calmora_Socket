const mongoose = require("mongoose");
const User = require("./userModel");

const patientSchema = new mongoose.Schema({
  address: { type: String, default: null },
  dateOfBirth: { type: Date, required: true },
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relation: { type: String },
  },
  surveyCompleted: {
    type: Boolean,
    default: false,
  },
  medicalHistory: { type: String, default: null },
  therapyGoals: { type: [String], default: [] },
});

module.exports = User.discriminator("Patient", patientSchema);
