const jwt = require('jsonwebtoken');
const { AuthError, AppError } = require('../utils/error');

const JWT_SECRET = process.env.JWT_SECRET;

async function jwtAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      throw new AuthError('Authorization token missing');
    }

    if (!JWT_SECRET) {
      throw new AppError('JWT secret is not configured', 500);
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach decoded payload (user info) to request for downstream handlers
    req.user = decoded;

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AuthError('Token expired'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new AuthError('Invalid token'));
    }
    if (!(err instanceof AppError)) {
      return next(new AppError('JWT verification failed', 500, true, { raw: err }));
    }
    return next(err);
  }
}

module.exports = {
  jwtAuthMiddleware,
};
