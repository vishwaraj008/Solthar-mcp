const jwt = require('jsonwebtoken');
const { AppError } = require('./error');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

async function generateAccessToken(payload) {
  try {
    if (!JWT_SECRET) {
      throw new AppError('JWT secret is not configured', 500);
    }
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  } catch (err) {
    throw new AppError('Failed to generate access token', 500, true, { raw: err });
  }
}

async function generateRefreshToken(payload) {
  try {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
  } catch (err) {
    throw new AppError('Failed to generate refresh token', 500, true, { raw: err });
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
