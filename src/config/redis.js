const { Redis } = require('@upstash/redis');
const { AppError } = require('../utils/error');

let redisClient;

function getRedisClient() {
  if (!redisClient) {
    if (!process.env.REDIS_URL) {
      throw new AppError('REDIS_URL not defined in environment variables', 500);
    }
    redisClient = new Redis({
      url: process.env.REDIS_URL,
    });
  }
  return redisClient;
}

async function testConnection() {
  try {
    const client = getRedisClient();
    await client.ping();
  } catch (err) {
    throw new AppError('Failed to connect to Redis', 500, true, { raw: err });
  }
}

module.exports = {
  getRedisClient,
  testConnection,
};
