const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["chat", "appointment", "article"], required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  extra: { type: mongoose.Schema.Types.Mixed, default: {} }, 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);
