const mysql = require('../config/mysql');

/**
 * Save a request log entry to DB
 * @param {Object} logData
 * @param {number} logData.user_id
 * @param {string} logData.api_key
 * @param {string} logData.prompt
 * @param {string} logData.response
 * @param {Date} logData.created_at
 * @returns {Promise<number>} Inserted record ID
 */
async function createRequestLog(logData) {
  try {
    const sql = `
      INSERT INTO request_logs (user_id, api_key, prompt, response, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;

    const params = [
      logData.user_id,
      logData.api_key,
      logData.prompt,
      logData.response,
      logData.created_at,
    ];

    const [result] = await mysql.execute(sql, params);
    return result.insertId;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createRequestLog,
};
