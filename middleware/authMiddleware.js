const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    console.log('Received Token:', token); 

    if (!token) {
        return res.status(401).json({ message: 'Access Denied! No Token Provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded Token:', decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.log('Token Verification Error:', error);
        res.status(400).json({ message: 'Invalid Token.' });
    }
};

const isPatient = (req, res, next) => {
    if (req.user && req.user.userType.toLowerCase() === 'patient') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden! You are not a Patient.' });
    }
};

const isSpecialist = (req, res, next) => {
    if (req.user && req.user.userType.toLowerCase() === 'specialist') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden! You are not a Specialist.' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.userType.toLowerCase() === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden! You are not a Admin.' });
    }
};

module.exports = { verifyToken, isPatient, isSpecialist, isAdmin };
