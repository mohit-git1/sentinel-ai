const Repository = require('../models/Repository');
const PullRequest = require('../models/PullRequest');
const User = require('../models/User');
const aiReviewService = require('./aiReview');
const githubService = require('./githubService');

/**
 * Process an incoming pull_request webhook event from GitHub.
 *
 * Workflow:
 *   1. Find the connected repository in our database
 *   2. Create or update the PullRequest record
 *   3. If the PR was just opened or updated, trigger an AI review
 *   4. Post the review comments back to GitHub
 *
 * @param {object} payload - The GitHub webhook payload
 */
const processPullRequestEvent = async (payload) => {
    const { action, pull_request: pr, repository } = payload;

    // Only review when a PR is opened or new commits are pushed
    if (!['opened', 'synchronize', 'reopened'].includes(action)) {
        console.log(`[Webhook] Ignoring PR action '${action}' — not a reviewable action`);
        return;
    }

    console.log(`[Webhook] PR detected: Action '${action}' on PR #${pr.number} in ${repository.full_name}`);

    // Find the connected repository
    const repo = await Repository.findOne({ fullName: repository.full_name });
    if (!repo) {
        console.log(`[Webhook] Repository '${repository.full_name}' not found in database — skipping`);
        return;
    }
    if (!repo.isActive) {
        console.log(`[Webhook] Repository '${repository.full_name}' is inactive — skipping`);
        return;
    }

    const user = await User.findById(repo.userId);
    if (!user) {
        console.log(`[Webhook] No user found for repo '${repository.full_name}' — skipping`);
        return;
    }

    // Upsert the pull request record
    let pullRequest = await PullRequest.findOne({ repoId: repo._id, prNumber: pr.number });

    if (!pullRequest) {
        pullRequest = await PullRequest.create({
            repoId: repo._id,
            prNumber: pr.number,
            title: pr.title,
            author: pr.user.login,
            diffUrl: pr.diff_url,
        });
        console.log(`[Webhook] Created new PullRequest record for PR #${pr.number}`);
    } else {
        pullRequest.title = pr.title;
        pullRequest.status = 'open';
        await pullRequest.save();
        console.log(`[Webhook] Updated existing PullRequest record for PR #${pr.number}`);
    }

    // Fetch the diff, run AI review, and post comments
    try {
        console.log(`[AI Review] Fetching diff for PR #${pr.number} ...`);
        const diff = await githubService.getPRDiff(user.accessToken, repo.fullName, pr.number);

        if (!diff || diff.trim() === '') {
            console.log(`[AI Review] No diff content for PR #${pr.number} — skipping review`);
            return;
        }

        console.log(`[AI Review] Sending diff to Gemini for PR #${pr.number} (${diff.length} chars) ...`);
        const review = await aiReviewService.reviewDiff(diff);

        console.log(`[AI Review] Got ${review.comments.length} comments from Gemini for PR #${pr.number}`);

        // Save review to database
        const Review = require('../models/Review');
        await Review.create({
            prId: pullRequest._id,
            comments: review.comments,
            summary: review.summary,
        });

        // Post comments back to GitHub
        console.log(`[AI Review] Posting review comment on GitHub PR #${pr.number} ...`);
        await githubService.postReviewComments(
            user.accessToken,
            repo.fullName,
            pr.number,
            review.comments,
            review.summary
        );

        pullRequest.status = 'reviewed';
        await pullRequest.save();

        console.log(`✅ Successfully reviewed PR #${pr.number} on ${repo.fullName}`);
    } catch (error) {
        console.error(`❌ Failed to review PR #${pr.number}: ${error.message}`);
        console.error(`   Stack: ${error.stack}`);
    }
};


/**
 * Fallback: poll GitHub API for open pull requests in all active repositories.
 * This runs on server boot and then every 60 seconds to catch any PRs
 * that were missed by the webhook (e.g. if the webhook URL is unreachable).
 */
const pollPullRequests = async () => {
    try {
        const repos = await Repository.find({ isActive: true });

        if (repos.length === 0) {
            console.log('[Polling] No active repositories found — nothing to poll');
            return;
        }

        console.log(`[Polling] Checking ${repos.length} active repositor${repos.length === 1 ? 'y' : 'ies'} for open PRs...`);

        for (const repo of repos) {
            const user = await User.findById(repo.userId);
            if (!user) {
                console.log(`[Polling] No user found for repo '${repo.fullName}' — skipping`);
                continue;
            }

            const [owner, repoName] = repo.fullName.split('/');

            try {
                const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/pulls?state=open`, {
                    headers: {
                        'Authorization': `Bearer ${user.accessToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`[Polling] GitHub API error for '${repo.fullName}': ${response.status} — ${errorText}`);
                    continue;
                }

                const pulls = await response.json();
                console.log(`[Polling] Found ${pulls.length} open PR(s) in '${repo.fullName}'`);

                for (const pr of pulls) {
                    const existing = await PullRequest.findOne({ repoId: repo._id, prNumber: pr.number });

                    if (!existing || existing.status !== 'reviewed') {
                        console.log(`[Polling] Unreviewed PR #${pr.number} detected in '${repo.fullName}' — triggering AI review`);
                        await processPullRequestEvent({
                            action: 'opened',
                            pull_request: pr,
                            repository: { full_name: repo.fullName }
                        });
                    }
                }
            } catch (repoError) {
                console.error(`[Polling] Error polling '${repo.fullName}': ${repoError.message}`);
            }
        }
    } catch (error) {
        console.error('[Polling] Fatal error:', error.message);
        console.error('  Stack:', error.stack);
    }
};

// Run immediately on boot, then every 2 minutes as a fallback mechanism
setTimeout(() => {
    console.log('[Polling] Initial poll starting...');
    pollPullRequests();
}, 3000); // Delay 3 seconds to let DB connect first
setInterval(pollPullRequests, 2 * 60 * 1000);

module.exports = { processPullRequestEvent, pollPullRequests };
