const crypto = require('crypto');
const webhookService = require('../services/webhookService');

/**
 * Handle incoming GitHub webhook events.
 * Verifies the webhook signature, then delegates to the webhook service.
 */
exports.handleWebhook = async (req, res, next) => {
    try {
        const signature = req.headers['x-hub-signature-256'];
        const event = req.headers['x-github-event'];
        const body = req.body;

        // Verify the HMAC-SHA256 signature from GitHub
        if (process.env.GITHUB_WEBHOOK_SECRET) {
            const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET);
            const digest = 'sha256=' + hmac.update(body).digest('hex');

            if (!crypto.timingSafeEqual(Buffer.from(signature || ''), Buffer.from(digest))) {
                return res.status(401).json({ error: 'Invalid webhook signature' });
            }
        }

        const payload = JSON.parse(body.toString());

        // We only care about pull_request events
        if (event === 'pull_request') {
            await webhookService.processPullRequestEvent(payload);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        next(error);
    }
};
