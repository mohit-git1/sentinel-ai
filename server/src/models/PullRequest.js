const mongoose = require('mongoose');

const pullRequestSchema = new mongoose.Schema({
    repoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Repository',
        required: true,
    },
    prNumber: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'merged', 'reviewed'],
        default: 'open',
    },
    // URL to fetch the raw diff from GitHub
    diffUrl: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('PullRequest', pullRequestSchema);
