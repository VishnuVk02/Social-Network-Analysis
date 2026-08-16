const express = require('express');
const telemetryController = require('../controllers/telemetry.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// All telemetry actions require authenticated user
router.use(authenticate);

router.post('/heartbeat', telemetryController.heartbeat);
router.post('/event', telemetryController.recordEvent);

module.exports = router;
