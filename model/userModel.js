const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: null },
    phoneNumber: { type: String, required: true },
    gender: {type: String, required: true, enum:['male', 'female']},
    userType: { type: String, required: true, enum: ['patient', 'specialist'] },
  },
  { timestamps: true, discriminatorKey: 'userType' }
);

module.exports = mongoose.model('User', userSchema);
