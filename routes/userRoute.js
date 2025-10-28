const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const { verifyToken, isPatient, isSpecialist, isAdmin } = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', authController.createUser);
router.post('/send-verification-otp', authController.sendVerificationOTP); 
router.post('/login', authController.loginUser);
router.post('/verify-otp', authController.verifyOTP);

// Protected Routes
router.get('/profile', verifyToken, authController.getProfile); 
router.put('/profile', verifyToken, authController.editProfile); 
router.get('/specialists', verifyToken, authController.getSpecialistList); 
router.get('/patient-data', verifyToken, isPatient, authController.getPatientData); 


// Fetch a specialist by ID
router.get('/specialists/:specialistId', verifyToken, authController.getSpecialistById);

// Forget Password
router.post("/forgot-password", authController.requestPasswordReset);
router.post("/verify-reset-otp", authController.verifyResetOTP);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
