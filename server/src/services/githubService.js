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

    // Fetch changed files using GET /repos/{owner}/{repo}/pulls/{pull_number}/files
    const { data: files } = await octokit.rest.pulls.listFiles({
        owner,
        repo,
        pull_number: prNumber,
    });

    console.log(`[Logs] files fetched: ${files.length} changed files for PR #${prNumber}`);

    let diffString = '';
    files.forEach(file => {
        if (file.patch) {
            diffString += `--- a/${file.filename}\n+++ b/${file.filename}\n${file.patch}\n\n`;
        }
    });

    return diffString;
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
        events: ['pull_request', 'pull_request_review', 'pull_request_review_comment'],
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
const postReviewComments = async (accessToken, fullName, prNumber, comments, summary) => {
    const [owner, repo] = fullName.split('/');
    const octokit = new Octokit({ auth: accessToken });

    // Build a formatted review body from all comments
    const bodyStr = comments && comments.length > 0
        ? comments.map((c) => `**${(c.type || 'NOTE').toUpperCase()}** in \`${c.file}\` (line ${c.line || 'unknown'}):\n${c.issue}\n\n💡 *Suggestion:* ${c.suggestion}`).join('\n\n---\n\n')
        : '';

    const finalComment = `## 🛡️ Sentinel AI Review\n\n**Summary:**\n${summary || 'No summary provided.'}\n\n${bodyStr ? '---\n\n### Detailed Feedback\n\n' + bodyStr : '\n*✅ No critical issues found! Great job.*'}`;

    await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: finalComment,
    });

    console.log(`[Logs] comment posted on PR #${prNumber}`);
};

module.exports = { getPRDiff, createWebhook, deleteWebhook, postReviewComments };
