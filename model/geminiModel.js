const mongoose = require('mongoose');

const geminiSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isCalmoraChat: { type: Boolean, default: false }, 
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
