const Repository = require('../models/Repository');
const PullRequest = require('../models/PullRequest');
const User = require('../models/User');
const aiReviewService = require('./aiReview');
const githubService = require('./githubService');

const jobQueue = [];

/**
 * Process an incoming pull_request webhook event from GitHub.
 *
 * Workflow:
 *   1. Find the connected repository in our database
 *   2. Create or update the PullRequest record with status 'pending'
 *   3. Enqueue the PR for background processing and return immediately
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
    if (!repo || !repo.isActive) {
        console.log(`[Webhook] Repository '${repository.full_name}' inactive or not found — skipping`);
        return;
    }

    const user = await User.findById(repo.userId);
    if (!user) {
        console.log(`[Webhook] No user found for repo '${repository.full_name}' — skipping`);
        return;
    }

    // Upsert the pull request record immediately with status 'pending'
    let pullRequest = await PullRequest.findOne({ repoId: repo._id, prNumber: pr.number });

    if (!pullRequest) {
        pullRequest = await PullRequest.create({
            repoId: repo._id,
            prNumber: pr.number,
            title: pr.title,
            author: pr.user.login,
            diffUrl: pr.diff_url,
            status: 'pending'
        });
        console.log(`[Webhook] Created new PullRequest record for PR #${pr.number}`);
    } else {
        pullRequest.title = pr.title;
        pullRequest.status = 'pending';
        await pullRequest.save();
        console.log(`[Webhook] Updated existing PullRequest record for PR #${pr.number}`);
    }

    // Queue AI review as a background job
    jobQueue.push({
        prId: pullRequest._id,
        prNumber: pr.number,
        repoFullName: repo.fullName,
        accessToken: user.accessToken
    });
    console.log(`[Webhook] Queued background AI review job for PR #${pr.number}`);
};


/**
 * Background worker that continuously processes queued PR review jobs.
 */
async function processJobs() {
    while (true) {
        if (jobQueue.length === 0) {
            await new Promise(r => setTimeout(r, 1000));
            continue;
        }

        const job = jobQueue.shift();
        try {
            console.log(`[Worker] Started AI review for PR #${job.prNumber}`);
            
            // 1. Fetch diff
            const diff = await githubService.getPRDiff(job.accessToken, job.repoFullName, job.prNumber);
            if (!diff || diff.trim() === '') {
                console.log(`[Worker] No diff content for PR #${job.prNumber} — skipping review`);
                await PullRequest.findByIdAndUpdate(job.prId, { status: 'reviewed' });
                continue;
            }

            // 2. Transmit to NVIDIA AI
            const review = await aiReviewService.reviewDiff(diff);
            console.log(`[Worker] Got ${review.comments.length} comments from NVIDIA AI for PR #${job.prNumber}`);
            
            // 3. Save to database
            const Review = require('../models/Review');
            await Review.create({
                prId: job.prId,
                comments: review.comments,
                summary: review.summary,
                optimizations: review.optimizations || [],
            });

            // 4. Post comments to GitHub
            console.log(`[Worker] Posting review comment on GitHub PR #${job.prNumber} ...`);
            await githubService.postReviewComments(
                job.accessToken,
                job.repoFullName,
                job.prNumber,
                review.comments,
                review.summary
            );

            // 5. Update status
            await PullRequest.findByIdAndUpdate(job.prId, { status: 'reviewed' });
            console.log(`✅ [Worker] Successfully reviewed PR #${job.prNumber}`);
        } catch (error) {
            console.error(`❌ [Worker] Failed to review PR #${job.prNumber}:`, error);
            await PullRequest.findByIdAndUpdate(job.prId, { status: 'failed' });
        }
    }
}

// Start queue worker immediately
processJobs();

/**
 * Fallback: poll GitHub API for open pull requests in all active repositories.
 * This runs every 30 seconds to catch any PRs that miss the webhook (e.g. testing locally).
 */
const pollPullRequests = async () => {
    try {
        const repos = await Repository.find({ isActive: true });
        if (repos.length === 0) return;

        for (const repo of repos) {
            const user = await User.findById(repo.userId);
            if (!user) continue;

            const [owner, repoName] = repo.fullName.split('/');
            try {
                const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/pulls?state=open`, {
                    headers: {
                        'Authorization': `Bearer ${user.accessToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });

                if (!response.ok) continue;
                const pulls = await response.json();

                for (const pr of pulls) {
                    const existing = await PullRequest.findOne({ repoId: repo._id, prNumber: pr.number });

                    // Only queue unreviewed/unprocessed PRs
                    if (!existing || existing.status === 'open') {
                        console.log(`[Polling] New/unreviewed PR #${pr.number} caught by polling. Queueing job...`);
                        await processPullRequestEvent({
                            action: 'opened',
                            pull_request: pr,
                            repository: { full_name: repo.fullName }
                        });
                    }
                }
            } catch (err) {
                console.error(`[Polling] Failed to poll repo ${repo.fullName}`, err.message);
            }
        }
    } catch (err) {
        console.error('[Polling] Fatal error:', err.message);
    }
};

setTimeout(() => {
    console.log('[Polling] Initial local polling starting...');
    pollPullRequests();
}, 3000);
setInterval(pollPullRequests, 30 * 1000);

module.exports = { processPullRequestEvent, pollPullRequests };
