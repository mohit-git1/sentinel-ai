const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Redirect user to GitHub OAuth authorization page
router.get('/github', authController.redirectToGitHub);

// GitHub redirects back here with an auth code — exchange it for a token
router.get('/github/callback', authController.handleGitHubCallback);

// Return the currently authenticated user's profile
router.get('/me', authController.getCurrentUser);

module.exports = router;
