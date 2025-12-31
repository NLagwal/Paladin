const express = require('express');
const axios = require('axios');
const router = express.Router();

const PDF_HOSTING_SERVICE_URL = process.env.PDF_HOSTING_SERVICE_URL;

router.post('/upload', async (req, res) => {
  try {
    const response = await axios.post(`${PDF_HOSTING_SERVICE_URL}/upload`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'An error occurred' });
  }
});

module.exports = router;
