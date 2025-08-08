const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { AppError } = require('../utils/error');
const authTokenModel = require('../models/authModel');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '1h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET not configured');
}

async function hashPassword(password) {
  try {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  } catch (err) {
    throw new AppError(
      'Error hashing password',
      500,
      true,
      {
        service: 'authService.hashPassword',
        raw: err,
      }
    );
  }
}

async function verifyPassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    throw new AppError(
      'Error verifying password',
      500,
      true,
      {
        service: 'authService.verifyPassword',
        raw: err,
      }
    );
  }
}

function generateToken(payload) {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  } catch (err) {
    throw new AppError(
      'Error generating JWT token',
      500,
      true,
      {
        service: 'authService.generateToken',
        raw: err,
      }
    );
  }
}

async function storeToken(userId, token) {
  try {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
    await authTokenModel.saveToken(userId, token, expiresAt);
  } catch (err) {
    throw new AppError(
      'Error storing auth token',
      500,
      true,
      {
        service: 'authService.storeToken',
        raw: err,
      }
    );
  }
}

async function revokeToken(token) {
  try {
    await authTokenModel.deleteToken(token);
  } catch (err) {
    throw new AppError(
      'Error revoking auth token',
      500,
      true,
      {
        service: 'authService.revokeToken',
        raw: err,
      }
    );
  }
}

async function validateToken(token) {
  try {
    const authToken = await authTokenModel.findToken(token);

    if (!authToken) {
      throw new AppError('Token is invalid or expired', 401);
    }

    return authToken;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  storeToken,
  revokeToken,
  validateToken,
};
