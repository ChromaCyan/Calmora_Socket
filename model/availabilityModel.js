const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema({
  specialist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  timeSlots: [
    {
      day: { type: String, required: true }, 
      startTime: { type: String, required: true }, 
      endTime: { type: String, required: true }, 
    },
  ],
});

module.exports = mongoose.model("Availability", availabilitySchema);
