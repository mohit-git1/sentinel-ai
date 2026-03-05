const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    repoName: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
        unique: true,
    },
    // Whether Sentinel AI is actively monitoring this repo
    isActive: {
        type: Boolean,
        default: true,
    },
    // GitHub webhook ID so we can remove it if the user disconnects
    webhookId: {
        type: Number,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Repository', repositorySchema);
