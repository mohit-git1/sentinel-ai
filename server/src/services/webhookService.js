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
    if (!['opened', 'synchronize'].includes(action)) return;

    // Find the connected repository
    const repo = await Repository.findOne({ fullName: repository.full_name });
    if (!repo || !repo.isActive) return;

    const user = await User.findById(repo.userId);
    if (!user) return;

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
    } else {
        pullRequest.title = pr.title;
        pullRequest.status = 'open';
        await pullRequest.save();
    }

    // Fetch the diff, run AI review, and post comments
    try {
        const diff = await githubService.getPRDiff(user.accessToken, repo.fullName, pr.number);
        const review = await aiReviewService.reviewDiff(diff);

        // Save review to database (imported inline to avoid circular deps)
        const Review = require('../models/Review');
        await Review.create({
            prId: pullRequest._id,
            comments: review.comments,
            summary: review.summary,
        });

        // Post comments back to GitHub
        await githubService.postReviewComments(
            user.accessToken,
            repo.fullName,
            pr.number,
            review.comments
        );

        pullRequest.status = 'reviewed';
        await pullRequest.save();

        console.log(`✅ Reviewed PR #${pr.number} on ${repo.fullName}`);
    } catch (error) {
        console.error(`❌ Failed to review PR #${pr.number}: ${error.message}`);
    }
};

module.exports = { processPullRequestEvent };
