const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// GitHub sends webhook events here as raw POST requests.
// We use express.raw() to preserve the raw body for HMAC signature verification.
router.post(
    '/github',
    express.raw({ type: 'application/json' }),
    webhookController.handleWebhook
);

module.exports = router;
