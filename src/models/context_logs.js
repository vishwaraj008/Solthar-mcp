const mysql = require('../config/mysql');
const { AppError } = require('../utils/error');
/**
 * Fetch conversation context log for a user from DB
 * @param {number|string} userId
 * @returns {Promise<object|null>} Parsed JSON object or null if none
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

    // Return parsed JSON (if stored as JSON string)
    return typeof rows[0].context === 'string'
      ? JSON.parse(rows[0].context)
      : rows[0].context;
  } catch (err) {
    console.log('Error fetching context log:', err);
    throw new AppError(
      'Database error while fetching context log',
      500,
      true,
      {
        service: 'userModel.findByEmail',
        raw: err,
      }
    );
  }

}

/**
 * Save conversation context log for a user in DB
 * @param {number|string} userId
 * @param {object} contextData Context data to store
 * @param {string} sessionId Unique session identifier
 * @returns {Promise<number>} Inserted record ID
 */
async function saveContextLog(userId, contextData, sessionId) {
  try {
    const sql = `
      INSERT INTO context_logs (user_id, session_id, context)
      VALUES (?, ?, ?)
    `;

    const params = [userId, sessionId, JSON.stringify(contextData)];
    const [result] = await mysql.execute(sql, params);
    return result.insertId;
  } catch (err) {
    console.log('Error saving context log:', err);
    throw new AppError(
      'Database error while saving context log',
      500,
      true,
      {
        service: 'contextModel.saveContextLog',
        raw: err,
      }
    );
  }
}

module.exports = {
  getContextLog,
  saveContextLog,
};
