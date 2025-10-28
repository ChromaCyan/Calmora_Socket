const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: null },
    phoneNumber: { type: String, required: true },
    gender: {type: String, required: true, enum:['male', 'female']}, 
    userType: { type: String, required: true, enum: ['patient', 'specialist', 'admin'] },
    rejectionReason: { type: String, default: null },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true, discriminatorKey: 'userType' }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
