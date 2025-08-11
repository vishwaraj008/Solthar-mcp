// src/models/request_logs.js
const pool = require('../config/mysql');
const { AppError } = require('../utils/error');

/**
 * Save a request log entry to DB
 * @param {Object} logData
 * @param {number} logData.user_id - ID of the user making the request
 * @param {Object} logData.request_payload - Request data sent to the tool (JSON)
 * @param {Object} [logData.response_payload] - Response data from the tool (JSON)
 * @param {number} [logData.processing_time_ms] - Time taken to process request in ms
 * @param {string} [logData.tool_used] - Name of the tool used (e.g., "Athena", "Moad")
 * @returns {Promise<number>} Inserted record ID
 */
async function createRequestLog(logData) {
  try {
    const params = [
      logData.user_id ?? null,
      JSON.stringify(logData.request_payload ?? {
        api_key: logData.api_key ?? null,
        prompt: logData.prompt ?? null
      }),
      logData.response_payload
        ? JSON.stringify(logData.response_payload)
        : JSON.stringify({ response: logData.response ?? null }),
      logData.processing_time_ms ?? null,
      logData.tool_used ?? 'Moad'
    ];

    const sql = `
      INSERT INTO request_logs 
        (user_id, request_payload, response_payload, processing_time_ms, tool_used)
      VALUES (?, CAST(? AS JSON), CAST(? AS JSON), ?, ?)
    `;

    const [result] = await pool.execute(sql, params);
    return result.insertId;
  } catch (err) {
    throw new AppError(
      'Database error while creating request log',
      500,
      true,
      {
        service: 'requestLogsModel.createRequestLog',
        query: `
          INSERT INTO request_logs 
            (user_id, request_payload, response_payload, processing_time_ms, tool_used)
          VALUES (?, CAST(? AS JSON), CAST(? AS JSON), ?, ?)
        `,
        input: logData,
        raw: err,
      }
    );
  }
}


/**
 * Fetch all request logs for a user
 * @param {number} userId
 * @returns {Promise<Array>}
 */
async function findByUserId(userId) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM request_logs WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  } catch (err) {
    throw new AppError(
      'Database error while fetching request logs by user_id',
      500,
      true,
      {
        service: 'requestLogsModel.findByUserId',
        query: 'SELECT * FROM request_logs WHERE user_id = ? ORDER BY created_at DESC',
        input: { userId },
        raw: err,
      }
    );
  }
}

module.exports = {
  createRequestLog,
  findByUserId,
};
