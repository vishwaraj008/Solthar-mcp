const { findByEmail } = require('../models/user.model');
const {
  verifyPassword,
  generateToken,
  storeToken,
  revokeToken,
} = require('../services/authService');
const { AppError } = require('../utils/error');

async function login(req, res, next) {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await findByEmail(email);

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    await storeToken(user.id, token);

    res.json({ token: token });
  } catch (err) {
    if (!(err instanceof Error)) {
      return next(
        new AppError("Unhandled error while initialzing mcp", 500, true, {
          controller: "authController.loginController",
          raw: err,
        })
      );
    }

    if (!(err instanceof AppError)) {
      return next(
        new AppError("Unexpected error while initialzing mcp", 500, true, {
          controller: "authController.loginController",
          raw: err,
        })
      );
    }

    return next(err);
  
    }
}

async function logout(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      throw new AppError('Authorization token missing', 401);
    }

    await revokeToken(token);

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    if (!(err instanceof Error)) {
      return next(
        new AppError("Unhandled error while initialzing mcp", 500, true, {
          controller: "authController.logoutController",
          raw: err,
        })
      );
    }

    if (!(err instanceof AppError)) {
      return next(
        new AppError("Unexpected error while initialzing mcp", 500, true, {
          controller: "authController.logoutController",
          raw: err,
        })
      );
    }

    return next(err);
  
    }
}

module.exports = {
  login,
  logout,
};
