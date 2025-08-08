const mysql = require('../config/mysql');

/**
 * Fetch conversation context log for a user from DB
 * @param {number|string} userId
 * @returns {Promise<string|null>} JSON string of context or null if none
 */
async function getContextLog(userId) {
  try {
    const [rows] = await mysql.execute(
      'SELECT context FROM context_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    if (rows.length === 0) {
      return null;
    }
    return rows[0].context_data;
  } catch (err) {
    throw err;
  }
}

/**
 * Save conversation context log for a user in DB
 * @param {number|string} userId
 * @param {string} contextData JSON string
 * @returns {Promise<number>} Inserted/updated record ID
 */
async function saveContextLog(userId, contextData) {
  try {
    // You can do INSERT or UPSERT logic here.
    // For simplicity, insert a new record each time:

    const sql = `
      INSERT INTO context_logs (user_id, context_data, updated_at)
      VALUES (?, ?, NOW())
    `;

    const params = [userId, contextData];
    const [result] = await mysql.execute(sql, params);
    return result.insertId;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getContextLog,
  saveContextLog,
};
