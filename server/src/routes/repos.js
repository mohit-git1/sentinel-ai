const express = require('express');
const router = express.Router();
const repoController = require('../controllers/repoController');
const authMiddleware = require('../middleware/auth');

// List all repositories connected by the authenticated user
router.get('/', authMiddleware, repoController.listRepos);

// Connect a new repository (creates a GitHub webhook)
router.post('/connect', authMiddleware, repoController.connectRepo);

// Disconnect a repository (removes the GitHub webhook)
router.delete('/:id', authMiddleware, repoController.disconnectRepo);

// Get pull requests for a specific repository
router.get('/:id/pulls', authMiddleware, repoController.getRepoPulls);

module.exports = router;
