const Repository = require('../models/Repository');
const PullRequest = require('../models/PullRequest');
const User = require('../models/User');
const githubService = require('../services/githubService');

/**
 * List all repositories the authenticated user has connected.
 */
exports.listRepos = async (req, res, next) => {
    try {
        const repos = await Repository.find({ userId: req.user.userId });
        res.json(repos);
    } catch (error) {
        next(error);
    }
};

/**
 * Connect a GitHub repository by creating a webhook that
 * sends pull_request events to our server.
 */
exports.connectRepo = async (req, res, next) => {
    try {
        const { repoName, fullName } = req.body;
        const user = await User.findById(req.user.userId);

        // Check if this user already connected this repo
        const existingForUser = await Repository.findOne({ fullName, userId: user._id });
        if (existingForUser) return res.status(409).json({ error: 'Repository already connected' });

        // If another user had this repo connected, reassign it to the current user
        const existingGlobal = await Repository.findOne({ fullName });
        if (existingGlobal) {
            existingGlobal.userId = user._id;
            existingGlobal.isActive = true;
            await existingGlobal.save();
            console.log(`[Repo] Reassigned '${fullName}' to user ${user.username}`);
            return res.status(201).json(existingGlobal);
        }

        // Create a GitHub webhook for pull_request events
        let webhookId = null;
        try {
            webhookId = await githubService.createWebhook(
                user.accessToken,
                fullName,
                process.env.GITHUB_WEBHOOK_SECRET
            );
        } catch (webhookErr) {
            // Webhook creation can fail if one already exists or if running locally
            // Still allow connection — the polling fallback will handle PR detection
            console.warn(`[Repo] Webhook creation failed for '${fullName}': ${webhookErr.message}. Falling back to polling.`);
        }

        const repo = await Repository.create({
            userId: user._id,
            repoName,
            fullName,
            webhookId,
        });

        res.status(201).json(repo);
    } catch (error) {
        next(error);
    }
};

/**
 * Disconnect a repository — removes the webhook from GitHub
 * and deletes the repo record from the database.
 */
exports.disconnectRepo = async (req, res, next) => {
    try {
        const repo = await Repository.findById(req.params.id);
        if (!repo) return res.status(404).json({ error: 'Repository not found' });

        const user = await User.findById(repo.userId);

        // Remove the webhook from GitHub if it exists
        if (repo.webhookId) {
            await githubService.deleteWebhook(user.accessToken, repo.fullName, repo.webhookId);
        }

        await Repository.findByIdAndDelete(req.params.id);
        res.json({ message: 'Repository disconnected' });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all pull requests for a specific connected repository.
 */
exports.getRepoPulls = async (req, res, next) => {
    try {
        const pulls = await PullRequest.find({ repoId: req.params.id })
            .sort({ createdAt: -1 });
        res.json(pulls);
    } catch (error) {
        next(error);
    }
};
