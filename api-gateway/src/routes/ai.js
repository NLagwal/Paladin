const express = require('express');
const axios = require('axios');
const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai_service:8000';

// Validate request body
const validateChatRequest = (req, res, next) => {
    if (!req.body || !req.body.message) {
        return res.status(400).json({
            message: 'Invalid request: "message" field is required'
        });
    }
    if (typeof req.body.message !== 'string' || req.body.message.trim().length === 0) {
        return res.status(400).json({
            message: 'Invalid request: "message" must be a non-empty string'
        });
    }
    next();
};

router.post('/chat', validateChatRequest, async (req, res) => {
    try {
        if (!AI_SERVICE_URL) {
            return res.status(500).json({
                message: 'AI service URL is not configured'
            });
        }

        const response = await axios.post(
            `${AI_SERVICE_URL}/chat`,
            { message: req.body.message.trim() },
            {
                timeout: 60000, // 60 second timeout
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('AI service error:', error.message);

        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            return res.status(503).json({
                message: 'AI service is unavailable. Please try again later.'
            });
        }

        if (error.response) {
            return res.status(error.response.status).json(
                error.response.data || {
                    message: 'An error occurred while processing your request'
                }
            );
        }

        res.status(500).json({
            message: 'An unexpected error occurred while communicating with the AI service'
        });
    }
});

router.get('/status', async (req, res) => {
    try {
        const response = await axios.get(`${AI_SERVICE_URL}/status`, { timeout: 5000 });
        res.json(response.data);
    } catch (error) {
        res.status(503).json({ status: "OFFLINE", mode: "UNKNOWN", uptime: "Unknown" });
    }
});

router.get('/logs', async (req, res) => {
    try {
        const response = await axios.get(`${AI_SERVICE_URL}/logs`, { timeout: 5000 });
        res.json(response.data);
    } catch (error) {
        res.json([]);
    }
});

router.get('/config', async (req, res) => {
    try {
        const response = await axios.get(`${AI_SERVICE_URL}/config`, { timeout: 5000 });
        res.json(response.data);
    } catch (error) {
        res.status(503).json({ error: "Failed to fetch config" });
    }
});

router.post('/config', async (req, res) => {
    // Reuse validateChatRequest for body check, or make new one. 
    // Actually validateChatRequest checks for 'message', which we don't need here.
    // Let's just do straight axios call, the backend will validate schema.
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/config`, req.body, {
            headers: { 'Content-Type': 'application/json' }
        });
        res.json(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: "Failed to update config" });
        }
    }
});

module.exports = router;
