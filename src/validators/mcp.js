const Joi = require('joi');
const logger = require('../utils/logger');

// Common schemas
const contextSchema = Joi.object({
  previousMessages: Joi.array().items(Joi.string()).optional(),
  intent: Joi.string().optional(),
  language: Joi.string().default('en').optional(),
  metadata: Joi.object().optional()
});

const configSchema = Joi.object({
  response_type: Joi.string().valid('concise', 'detailed', 'comprehensive').default('detailed').optional(),
  return_thought_process: Joi.boolean().default(false).optional(),
  max_tokens: Joi.number().integer().min(1).max(8000).optional(),
  temperature: Joi.number().min(0).max(2).optional(),
  model: Joi.string().optional()
});

const metadataSchema = Joi.object({
  source: Joi.string().optional(),
  device: Joi.string().optional(),
  location: Joi.string().optional(),
  timestamp: Joi.date().optional()
});

/**
 * Validate process request
 */
function validateProcessRequest(req, res, next) {
  const schema = Joi.object({
    message: Joi.string().required().min(1).max(10000),
    context: contextSchema.optional(),
    config: configSchema.optional(),
    metadata: metadataSchema.optional()
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    logger.warn({
      requestId: req.requestId,
      validationError: error.details,
      body: req.body
    }, 'Process request validation failed');

    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid request format',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      })),
      requestId: req.requestId
    });
  }

  req.body = value; // Use validated and sanitized data
  next();
}

/**
 * Validate save context request
 */
function validateSaveContext(req, res, next) {
  const schema = Joi.object({
    sessionId: Joi.string().required().min(1).max(100),
    contextType: Joi.string().valid('conversation', 'task', 'project').default('conversation'),
    contextData: Joi.object().required(),
    expiresIn: Joi.number().integer().min(60).max(86400 * 30).optional(), // max 30 days
    metadata: metadataSchema.optional()
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    logger.warn({
      requestId: req.requestId,
      validationError: error.details
    }, 'Save context validation failed');

    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid save context request',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      })),
      requestId: req.requestId
    });
  }

  req.body = value;
  next();
}

/**
 * Validate get context request
 */
function validateGetContext(req, res, next) {
  const schema = Joi.object({
    sessionId: Joi.string().required().min(1).max(100)
  });

  const { error, value } = schema.validate(req.params);

  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid session ID',
      requestId: req.requestId
    });
  }

  next();
}

/**
 * Validate delete context request
 */
function validateDeleteContext(req, res, next) {
  const schema = Joi.object({
    sessionId: Joi.string().required().min(1).max(100)
  });

  const { error, value } = schema.validate(req.params);

  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid session ID',
      requestId: req.requestId
    });
  }

  next();
}

/**
 * Validate chat request
 */
function validateChatRequest(req, res, next) {
  const schema = Joi.object({
    message: Joi.string().required().min(1).max(10000),
    sessionId: Joi.string().optional().min(1).max(100),
    context: contextSchema.optional(),
    config: configSchema.optional(),
    metadata: metadataSchema.optional()
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    logger.warn({
      requestId: req.requestId,
      validationError: error.details
    }, 'Chat request validation failed');

    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid chat request',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      })),
      requestId: req.requestId
    });
  }

  req.body = value;
  next();
}

/**
 * Validate generate request
 */
function validateGenerateRequest(req, res, next) {
  const schema = Joi.object({
    prompt: Joi.string().required().min(1).max(5000),
    type: Joi.string().valid('text', 'code', 'documentation', 'analysis').default('text'),
    context: contextSchema.optional(),
    config: configSchema.optional(),
    metadata: metadataSchema.optional()
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid generate request',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      })),
      requestId: req.requestId
    });
  }

  req.body = value;
  next();
}

/**
 * Validate analyze request
 */
function validateAnalyzeRequest(req, res, next) {
  const schema = Joi.object({
    content: Joi.string().required().min(1).max(50000),
    analysisType: Joi.string().valid('sentiment', 'summary', 'extraction', 'classification').required(),
    context: contextSchema.optional(),
    config: configSchema.optional(),
    metadata: metadataSchema.optional()
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid analyze request',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      })),
      requestId: req.requestId
    });
  }

  req.body = value;
  next();
}

/**
 * Validate batch request
 */
function validateBatchRequest(req, res, next) {
  const batchItemSchema = Joi.object({
    id: Joi.string().required(),
    type: Joi.string().valid('process', 'chat', 'generate', 'analyze').required(),
    payload: Joi.object().required()
  });

  const schema = Joi.object({
    requests: Joi.array().items(batchItemSchema).min(1).max(10).required(),
    config: configSchema.optional(),
    metadata: metadataSchema.optional()
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid batch request',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      })),
      requestId: req.requestId
    });
  }

  req.body = value;
  next();
}

module.exports = {
  validateProcessRequest,
  validateSaveContext,
  validateGetContext,
  validateDeleteContext,
  validateChatRequest,
  validateGenerateRequest,
  validateAnalyzeRequest,
  validateBatchRequest
};
