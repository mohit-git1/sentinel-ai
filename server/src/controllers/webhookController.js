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

            const sigBuf = Buffer.from(signature || '');
            const digBuf = Buffer.from(digest);

            // timingSafeEqual throws if lengths differ, so check lengths first
            if (sigBuf.length !== digBuf.length || !crypto.timingSafeEqual(sigBuf, digBuf)) {
                return res.status(401).json({ error: 'Invalid webhook signature' });
            }
        }

        const payload = JSON.parse(body.toString());
        console.log('[WEBHOOK] Received event:', payload.action, 'PR:', payload.pull_request?.number);
        console.log('[Logs] webhook received. Full Payload:', JSON.stringify(payload, null, 2));

        // We care about pull_request, pull_request_review, and pull_request_review_comment
        if (event === 'pull_request' || event === 'pull_request_review' || event === 'pull_request_review_comment') {
            await webhookService.processPullRequestEvent(payload);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        next(error);
    }
};
