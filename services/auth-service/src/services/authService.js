const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
require('dotenv').config();

// Fail fast if JWT secret is missing
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET not set in environment variables');
}

const signup = async (name, email, password) => {
  // Check if user already exists
  const { rows } = await pool.query(
    'SELECT 1 FROM users WHERE email = $1',
    [email]
  );

  if (rows.length > 0) {
    throw new Error('User already exists');
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  // Insert new user
  const { rows: newRows } = await pool.query(
    'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING user_id, username, email, role',
    [name, email, password_hash, 'user']
  );

  return newRows[0];
};

const login = async (email, password) => {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  const user = rows[0];

  // Same message for both cases (prevents user enumeration)
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    {
      userId: user.user_id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return token;
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new Error('Invalid token');
  }
};

module.exports = {
  signup,
  login,
  verifyToken,
};
