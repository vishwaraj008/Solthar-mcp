// src/utils/response.js

function sendSuccess(res, message, data = {}, statusCode = 200) {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function sendError(res, error, statusCode = 500) {
  // error can be an instance of your AppError or generic error
  res.status(statusCode).json({
    success: false,
    message: error.userMessage || 'An error occurred.',
    error: {
      code: error.code || 'UNKNOWN_ERROR',
      details: error.metadata || {},
    },
  });
}

module.exports = {
  sendSuccess,
  sendError,
};
