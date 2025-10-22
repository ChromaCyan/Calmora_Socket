const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    specialist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    timeSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimeSlot",
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true, 
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "completed", "expired"],
      default: "pending",
    },
    message: String,
    feedback: { type: String },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

const Appointment =
  mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment; 
