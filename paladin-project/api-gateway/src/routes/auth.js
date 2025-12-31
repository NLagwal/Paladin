const express = require('express');
const axios = require('axios');
const router = express.Router();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

router.post('/login', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/login`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'An error occurred' });
  }
});

router.post('/signup', async (req, res) => {
    try {
        const response = await axios.post(`${AUTH_SERVICE_URL}/signup`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'An error occurred' });
    }
});

router.get('/verify', async (req, res) => {
    try {
        const response = await axios.get(`${AUTH_SERVICE_URL}/verify`, {
            headers: {
                'Authorization': req.headers.authorization,
            },
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'An error occurred' });
    }
});

module.exports = router;
