const pool = require('../config/mysql');
const { AppError } = require('../utils/error');

async function findByEmail(email) {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length !== 1) {
      return null;
    }
    console.log(rows[0])
    return rows[0];
  } catch (err) {
    throw new AppError(
      'Database error while fetching user by email',
      500,
      true,
      {
        service: 'userModel.findByEmail',
        query: 'SELECT * FROM users WHERE email = ?',
        input: { email },
        raw: err,
      }
    );
  }
}

async function findById(id) {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);

    if (rows.length !== 1) {
      return null;
    }

    return rows[0];
  } catch (err) {
    throw new AppError(
      'Database error while fetching user by ID',
      500,
      true,
      {
        service: 'userModel.findById',
        query: 'SELECT * FROM users WHERE id = ?',
        input: { id },
        raw: err,
      }
    );
  }
}

module.exports = {
  findByEmail,
  findById,
};
