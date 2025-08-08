const mysql = require('../config/mysql'); // Your mysql connection/pool instance

/**
 * Fetch API key details from database
 * @param {string} apiKey
 * @returns {Promise<Object|null>} API key row or null if not found
 */
async function getApiKey(apiKey) {
  try {
    const [rows] = await mysql.execute(
      'SELECT id, api_key, expires_at, user_id, usage_limit, usage_count FROM api_keys WHERE api_key = ? LIMIT 1',
      [apiKey]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  } catch (err) {
    throw err; // Let upper layers handle or wrap in AppError if desired
  }
}
async function incrementUsageCount(apiKey) {
  try {
    await mysql.execute(
      'UPDATE api_keys SET usage_count = usage_count + 1 WHERE api_key = ?',
      [apiKey]
    );
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getApiKey,
  incrementUsageCount,
};


