const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  chatId: { type: String },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  senderFirstName: { type: String },
  senderLastName: { type: String },
  senderProfileImage: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
