// src/services/context.service.js

const Redis = require('ioredis');
const { AppError } = require('../utils/error');

let redisClient = null;

async function initialize() {
  try {
    const redisUrl = process.env.REDIS_URL; // Read Redis URL from env vars

    if (!redisUrl || typeof redisUrl !== 'string') {
      throw new AppError('Redis URL must be a valid string', 400);
    }

    if (redisClient) {
      // Already initialized
      return;
    }

    // Optional: remove or reduce this log for production
    console.log('Connecting to Redis...');

    redisClient = new Redis(redisUrl);

    // Test connection
    await redisClient.ping();

    // Initialize MySQL here if needed similarly from env vars

  } catch (err) {
    if (!(err instanceof AppError)) {
      throw new AppError('Failed to initialize context service', 500, true, { raw: err });
    }
    throw err;
  }
}

async function getContext(userId) {
  try {
    if (!redisClient) {
      throw new AppError('Redis client not initialized', 500);
    }

    if (!userId) {
      throw new AppError('User ID required to fetch context', 400);
    }

    const key = `cache:context:${userId}`;
    const data = await redisClient.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  } catch (err) {
    if (!(err instanceof AppError)) {
      throw new AppError('Failed to get user context', 500, true, { raw: err });
    }
    throw err;
  }
}

async function setContext(userId, context, ttlSeconds = 3600) {
  try {
    if (!redisClient) {
      throw new AppError('Redis client not initialized', 500);
    }

    if (!userId) {
      throw new AppError('User ID required to set context', 400);
    }

    const key = `cache:context:${userId}`;
    await redisClient.set(key, JSON.stringify(context), 'EX', ttlSeconds);
  } catch (err) {
    if (!(err instanceof AppError)) {
      throw new AppError('Failed to set user context', 500, true, { raw: err });
    }
    throw err;
  }
}

async function cacheMCPConfig(config) {
  try {
    if (!redisClient) {
      throw new AppError('Redis client not initialized', 500);
    }

    const key = `cache:mcp:config`;
    await redisClient.set(key, JSON.stringify(config));
  } catch (err) {
    if (!(err instanceof AppError)) {
      throw new AppError('Failed to cache MCP config', 500, true, { raw: err });
    }
    throw err;
  }
}

async function getMCPConfig() {
  try {
    if (!redisClient) {
      throw new AppError('Redis client not initialized', 500);
    }

    const key = `cache:mcp:config`;
    const data = await redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (err) {
    if (!(err instanceof AppError)) {
      throw new AppError('Failed to get MCP config', 500, true, { raw: err });
    }
    throw err;
  }
}

async function setLastCommand(commandName) {
  try {
    if (!redisClient) {
      throw new AppError('Redis client not initialized', 500);
    }

    const key = `cache:mcp:lastCommand`;
    await redisClient.set(key, commandName);
  } catch (err) {
    if (!(err instanceof AppError)) {
      throw new AppError('Failed to set last MCP command', 500, true, { raw: err });
    }
    throw err;
  }
}

async function getLastCommand() {
  try {
    if (!redisClient) {
      throw new AppError('Redis client not initialized', 500);
    }

    const key = `cache:mcp:lastCommand`;
    return await redisClient.get(key);
  } catch (err) {
    if (!(err instanceof AppError)) {
      throw new AppError('Failed to get last MCP command', 500, true, { raw: err });
    }
    throw err;
  }
}

async function close() {
  try {
    if (redisClient) {
      await redisClient.quit();
      redisClient = null;
    }
  } catch (err) {
    if (!(err instanceof AppError)) {
      throw new AppError('Failed to close Redis client', 500, true, { raw: err });
    }
    throw err;
  }
}

module.exports = {
  initialize,
  getContext,
  setContext,
  cacheMCPConfig,
  getMCPConfig,
  setLastCommand,
  getLastCommand,
  close,
};
