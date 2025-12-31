const express = require('express');
const router = express.Router();

const authRouter = require('./auth');
const notificationRouter = require('./notification');
const pdfRouter = require('./pdf');
const aiRouter = require('./ai');
const telemetryRouter = require('./telemetry');

router.use('/auth', authRouter);
router.use('/notifications', notificationRouter);
router.use('/pdfs', pdfRouter);
router.use('/ai', aiRouter);
router.use('/telemetry', telemetryRouter);

module.exports = router;
