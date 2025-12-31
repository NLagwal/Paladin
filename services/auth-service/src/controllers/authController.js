const authService = require('../services/authService');
const pool = require('../config/db');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await authService.login(email, password);
    res.json({ token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const verify = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        const decoded = authService.verifyToken(token);
        const { rows } = await pool.query('SELECT user_id, email, role FROM users WHERE user_id = $1', [decoded.userId]);
        const user = rows[0];
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await authService.signup(name, email, password);
        const token = await authService.login(email, password);
        res.json({ user, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
  login,
  verify,
  signup,
};
