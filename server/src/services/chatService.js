const { OpenAI } = require('openai');
const PullRequest = require('../models/PullRequest');
const Repository = require('../models/Repository');
const User = require('../models/User');
const Review = require('../models/Review');
const githubService = require('./githubService');

const client = new OpenAI({
    baseURL: 'https://integrate.api.nvidia.com/v1',
    apiKey: process.env.NVIDIA_API_KEY,
});

exports.chatWithAI = async (prId, userMessage, history) => {
    if (!process.env.NVIDIA_API_KEY) {
        throw new Error('NVIDIA_API_KEY environment variable is not set');
    }

    const pr = await PullRequest.findById(prId);
    if (!pr) throw new Error('Pull Request not found');
    
    const repo = await Repository.findById(pr.repoId);
    const user = await User.findById(repo.userId);
    const review = await Review.findOne({ prId }).sort({ createdAt: -1 });

    const diff = await githubService.getPRDiff(user.accessToken, repo.fullName, pr.prNumber);
    const trimmedDiff = diff.length > 15000 ? diff.substring(0, 15000) + '\n...(truncated)' : diff;

    const systemPrompt = `You are Sentinel AI, a code review assistant. You already reviewed this pull request. Answer the developer's follow-up questions clearly and concisely. Reference specific files and line numbers when relevant.

Original PR Diff:
${trimmedDiff}

Previous AI Review:
${JSON.stringify(review ? {summary: review.summary, comments: review.comments, optimizations: review.optimizations} : {})}`;
    
    const messages = [
        { role: 'system', content: systemPrompt }
    ];

    if (history && history.length > 0) {
        messages.push(...history);
    }
    
    messages.push({ role: 'user', content: userMessage });

    const completion = await client.chat.completions.create({
        model: 'microsoft/phi-4-mini-instruct',
        messages,
        temperature: 0.1,
        max_tokens: 1024,
    });

    return completion.choices[0].message.content;
};
