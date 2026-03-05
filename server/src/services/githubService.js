const { Octokit } = require('octokit');

/**
 * Fetch the raw diff for a pull request from GitHub.
 *
 * @param {string} accessToken - GitHub access token
 * @param {string} fullName    - "owner/repo" format
 * @param {number} prNumber    - PR number
 * @returns {string} Unified diff text
 */
const getPRDiff = async (accessToken, fullName, prNumber) => {
    const [owner, repo] = fullName.split('/');
    const octokit = new Octokit({ auth: accessToken });

    const { data } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: prNumber,
        mediaType: { format: 'diff' },
    });

    return data;
};

/**
 * Create a webhook on a GitHub repository to listen for pull_request events.
 *
 * @param {string} accessToken   - GitHub access token
 * @param {string} fullName      - "owner/repo"
 * @param {string} webhookSecret - Secret for HMAC verification
 * @returns {number} The created webhook's ID
 */
const createWebhook = async (accessToken, fullName, webhookSecret) => {
    const [owner, repo] = fullName.split('/');
    const octokit = new Octokit({ auth: accessToken });

    // The webhook URL should point to the deployed backend
    const webhookUrl = `${process.env.SERVER_URL || 'https://your-server.com'}/api/webhooks/github`;

    const { data } = await octokit.rest.repos.createWebhook({
        owner,
        repo,
        config: {
            url: webhookUrl,
            content_type: 'json',
            secret: webhookSecret,
        },
        events: ['pull_request'],
        active: true,
    });

    return data.id;
};

/**
 * Remove a webhook from a GitHub repository.
 */
const deleteWebhook = async (accessToken, fullName, webhookId) => {
    const [owner, repo] = fullName.split('/');
    const octokit = new Octokit({ auth: accessToken });

    await octokit.rest.repos.deleteWebhook({ owner, repo, hook_id: webhookId });
};

/**
 * Post inline review comments on a GitHub pull request.
 * Each comment is posted as a standalone PR comment since
 * Octokit's review API requires a commit SHA for line-level comments.
 *
 * @param {string} accessToken - GitHub access token
 * @param {string} fullName    - "owner/repo"
 * @param {number} prNumber    - PR number
 * @param {Array}  comments    - AI-generated comments with file, line, issue, suggestion
 */
const postReviewComments = async (accessToken, fullName, prNumber, comments) => {
    const [owner, repo] = fullName.split('/');
    const octokit = new Octokit({ auth: accessToken });

    // Build a formatted review body from all comments
    const body = comments
        .map((c) => `**${c.type.toUpperCase()}** in \`${c.file}\` (line ${c.line}):\n${c.issue}\n\n💡 *Suggestion:* ${c.suggestion}`)
        .join('\n\n---\n\n');

    if (body) {
        await octokit.rest.issues.createComment({
            owner,
            repo,
            issue_number: prNumber,
            body: `## 🛡️ Sentinel AI Review\n\n${body}`,
        });
    }
};

module.exports = { getPRDiff, createWebhook, deleteWebhook, postReviewComments };
