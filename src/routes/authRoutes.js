const express = require('express');
const { login, logout } = require('../controllers/authController');
const { jwtAuthMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Login - no auth needed
router.post('/login', login);

// Logout - requires valid JWT token
router.post('/logout', jwtAuthMiddleware, logout);

module.exports = router;