const mongoose = require('mongoose');

const geminiSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isCalmoraChat: { type: Boolean, default: true },
    messages: [
      {
        sender: { type: String, enum: ['user', 'ai'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('GeminiChat', geminiSchema);
