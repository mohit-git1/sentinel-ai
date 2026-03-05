const Review = require('../models/Review');
const PullRequest = require('../models/PullRequest');
const aiReviewService = require('../services/aiReview');
const githubService = require('../services/githubService');
const User = require('../models/User');
const Repository = require('../models/Repository');

/**
 * Get all reviews for a given pull request.
 */
exports.getReviewsByPR = async (req, res, next) => {
    try {
        const reviews = await Review.find({ prId: req.params.prId })
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single review by its ID.
 */
exports.getReviewById = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ error: 'Review not found' });
        res.json(review);
    } catch (error) {
        next(error);
    }
};

/**
 * Manually trigger an AI review for a pull request.
 * Fetches the diff from GitHub, sends it to GPT-4o-mini, saves the review,
 * and posts inline comments back to the PR.
 */
exports.triggerReview = async (req, res, next) => {
    try {
        const pr = await PullRequest.findById(req.params.prId);
        if (!pr) return res.status(404).json({ error: 'Pull request not found' });

        const repo = await Repository.findById(pr.repoId);
        const user = await User.findById(repo.userId);

        // 1. Fetch the diff from GitHub
        const diff = await githubService.getPRDiff(user.accessToken, repo.fullName, pr.prNumber);

        // 2. Send the diff to GPT-4o-mini for review
        const aiResult = await aiReviewService.reviewDiff(diff);

        // 3. Save the review to the database
        const review = await Review.create({
            prId: pr._id,
            comments: aiResult.comments,
            summary: aiResult.summary,
        });

        // 4. Post inline comments back to the GitHub PR
        await githubService.postReviewComments(
            user.accessToken,
            repo.fullName,
            pr.prNumber,
            aiResult.comments
        );

        // 5. Update the PR status
        pr.status = 'reviewed';
        await pr.save();

        res.json(review);
    } catch (error) {
        next(error);
    }
};
