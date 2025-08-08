class AppError extends Error {
  constructor(
    message,
    status = 500,
    shouldReport = true,
    metadata = {},
    code = "APP_ERROR",
    userMessage = "Something went wrong."
  ) {
    super(message);
    this.status = status;
    this.shouldReport = shouldReport;
    this.metadata = metadata;
    this.code = code;
    this.userMessage = userMessage;
  }
}

class AuthError extends AppError {
  constructor(
    message = "Unauthorized",
    metadata = {},
    userMessage = "You need to log in."
  ) {
    super(message, 401, false, metadata, "AUTH_ERROR", userMessage);
  }
}

class ValidationError extends AppError {
  constructor(
    message = "Invalid input",
    metadata = {},
    userMessage = "Please check your inputs."
  ) {
    super(message, 400, false, metadata, "VALIDATION_ERROR", userMessage);
  }
}

class PermissionError extends AppError {
  constructor(
    message = "Forbidden",
    metadata = {},
    userMessage = "You don’t have permission."
  ) {
    super(message, 403, false, metadata, "PERMISSION_DENIED", userMessage);
  }
}

class RateLimitError extends AppError {
  constructor(
    message = "Too many requests",
    metadata = {},
    userMessage = "You're going too fast."
  ) {
    super(message, 429, false, metadata, "RATE_LIMIT", userMessage);
  }
}

class NotFoundError extends AppError {
  constructor(
    message = "Resource not found",
    metadata = {},
    userMessage = "Item does not exist."
  ) {
    super(message, 404, false, metadata, "NOT_FOUND", userMessage);
  }
}

class ConflictError extends AppError {
  constructor(
    message = "Conflict error",
    metadata = {},
    userMessage = "This already exists."
  ) {
    super(message, 409, false, metadata, "CONFLICT", userMessage);
  }
}

module.exports = {
  AppError,
  AuthError,
  ValidationError,
  PermissionError,
  RateLimitError,
  NotFoundError,
  ConflictError,
};
