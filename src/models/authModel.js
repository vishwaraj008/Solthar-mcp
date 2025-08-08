const pool = require('../config/mysql');
const { AppError } = require('../utils/error');

async function saveToken(userId, token, expiresAt) {
  try {
    const [result] = await pool.query(
      'INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );

    if (!result || !result.insertId) {
      throw new AppError(
        'Failed to insert auth token',
        500,
        true,
        {
          service: 'authTokenModel.saveToken',
          input: { userId, token, expiresAt },
        }
      );
    }

    return result.insertId;
  } catch (err) {
    throw new AppError(
      'Database error during auth token insert',
      500,
      true,
      {
        service: 'authTokenModel.saveToken',
        input: { userId, token, expiresAt },
        raw: err,
      }
    );
  }
}

async function deleteToken(token) {
  try {
    const [result] = await pool.query('DELETE FROM auth_tokens WHERE token = ?', [token]);

    if (!result || result.affectedRows !== 1) {
      throw new AppError(
        'Failed to delete auth token',
        500,
        true,
        {
          service: 'authTokenModel.deleteToken',
          input: { token },
          affectedRows: result?.affectedRows,
        }
      );
    }

    return true;
  } catch (err) {
    throw new AppError(
      'Database error during auth token deletion',
      500,
      true,
      {
        service: 'authTokenModel.deleteToken',
        input: { token },
        raw: err,
      }
    );
  }
}

async function findToken(token) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM auth_tokens WHERE token = ? AND expires_at > NOW()',
      [token]
    );

    if (rows.length !== 1) {
      return null;
    }

    return rows[0];
  } catch (err) {
    throw new AppError(
      'Database error while fetching auth token',
      500,
      true,
      {
        service: 'authTokenModel.findToken',
        query: 'SELECT * FROM auth_tokens WHERE token = ? AND expires_at > NOW()',
        input: { token },
        raw: err,
      }
    );
  }
}

module.exports = {
  saveToken,
  deleteToken,
  findToken,
};
