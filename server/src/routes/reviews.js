const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');

// Get all reviews for a specific pull request
router.get('/pr/:prId', authMiddleware, reviewController.getReviewsByPR);

// Get a single review by its ID
router.get('/:id', authMiddleware, reviewController.getReviewById);

// Manually trigger an AI review for a pull request
router.post('/trigger/:prId', authMiddleware, reviewController.triggerReview);

// Get similar past issues
router.get('/similar/:type', authMiddleware, reviewController.getSimilarIssues);

module.exports = router;
