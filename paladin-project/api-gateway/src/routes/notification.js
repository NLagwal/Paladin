const express = require('express');
const axios = require('axios');
const router = express.Router();

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL;

router.get('/notifications', async (req, res) => {
  try {
    const response = await axios.get(`${NOTIFICATION_SERVICE_URL}/notifications`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'An error occurred' });
  }
});

module.exports = router;
