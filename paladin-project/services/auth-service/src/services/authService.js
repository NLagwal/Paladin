const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const login = async (email, password) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = rows[0];

  if (!user) {
    throw new Error("User not found");
  }

  if (password !== user.password_hash) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { userId: user.user_id, role: user.role, email: user.email },
    process.env.JWT_SECRET || "secret",
    {
      expiresIn: "1h",
    }
  );

  return token;
};

const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        return decoded;
    } catch (error) {
        throw new Error("Invalid token");
    }
};

const signup = async (name, email, password) => {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length > 0) {
        throw new Error('User already exists');
    }

    // In a real application, you should hash the password
    const password_hash = password;

    const { rows: newRows } = await pool.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, password_hash, 'user']
    );
    return newRows[0];
};

module.exports = {
  login,
  verifyToken,
  signup,
};
