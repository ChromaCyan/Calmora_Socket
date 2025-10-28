const mongoose = require("mongoose");
const User = require("./userModel");

const specialistSchema = new mongoose.Schema(
  {
    dateOfBirth: { type: Date, required: true },
    specialization: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    bio: { type: String, default: "No bio available." },
    yearsOfExperience: { type: Number, default: 0 },
    languagesSpoken: { type: [String], default: [] },
    availability: { type: String, default: "Available" },
    location: { type: String, default: "Dagupan City" },
    clinic: { type: String, default: null },
    workingHours: {
      start: { type: String, default: null },
      end: { type: String, default: null },
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, default: null },
    licenseVerificationData: {
      extractedName: { type: String, default: null },
      extractedLicenseNumber: { type: String, default: null },
      extractedProfession: { type: String, default: null },
      extractedExpiry: { type: String, default: null },
      confidenceScore: { type: Number, default: null },
    },
  },
  { timestamps: true }
);

module.exports = User.discriminator("Specialist", specialistSchema);
