// src/services/context.service.js

const Redis = require('ioredis');
const { AppError } = require('../utils/error');

let redisClient = null;

// Helper to truncate context
function truncateContextIfNeeded(context, maxLength = 500) {
  if (typeof context !== 'string') {
    return context;
  }
  
  if (context.length <= maxLength) {
    return context;
  }
  
  // Keep the beginning and end, with ellipsis in between
  const keepStart = Math.floor(maxLength * 0.4); // 40% from start (200 chars)
  const keepEnd = Math.floor(maxLength * 0.4);   // 40% from end (200 chars)
  
  return context.slice(0, keepStart) + 
         '\n... [truncated] ...\n' + 
         context.slice(-keepEnd);
}

async function initialize() {
  try {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl || typeof redisUrl !== 'string') {
      throw new AppError('Redis URL must be a valid string', 400);
    }

    if (redisClient) {
      return; // Already initialized
    }

    redisClient = new Redis(redisUrl);
    await redisClient.ping();
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

    return data ? JSON.parse(data) : null;
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

    // Apply truncation
    const truncatedContext = truncateContextIfNeeded(context);

    const key = `cache:context:${userId}`;
    await redisClient.set(key, JSON.stringify(truncatedContext), 'EX', ttlSeconds);
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
    return data ? JSON.parse(data) : null;
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
  truncateContextIfNeeded,
};
