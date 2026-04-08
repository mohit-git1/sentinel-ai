const jwt = require('jsonwebtoken');
const User = require('../models/User');

const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';

exports.redirectToGitHub = (_req, res) => {
    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        scope: 'repo read:user user:email',
        redirect_uri: `${process.env.BACKEND_URL}/api/auth/github/callback`,
    });
    res.redirect(`${GITHUB_AUTH_URL}?${params.toString()}`);
};

exports.handleGitHubCallback = async (req, res, next) => {
    try {
        const { code } = req.query;
        if (!code) return res.status(400).json({ error: 'Missing authorization code' });

        const tokenRes = await fetch(GITHUB_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
                redirect_uri: `${process.env.BACKEND_URL}/api/auth/github/callback`,
            }),
        });

        const tokenData = await tokenRes.json();
        if (tokenData.error) {
            return res.status(401).json({ error: tokenData.error_description });
        }

        const accessToken = tokenData.access_token;

        const userRes = await fetch(GITHUB_USER_URL, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const githubUser = await userRes.json();

        const user = await User.findOneAndUpdate(
            { githubId: String(githubUser.id) },
            {
                username: githubUser.login,
                email: githubUser.email || '',
                avatarUrl: githubUser.avatar_url,
                accessToken,
            },
            { upsert: true, new: true }
        );

        const token = jwt.sign(
            { userId: user._id, githubId: user.githubId },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    } catch (error) {
        next(error);
    }
};

exports.getCurrentUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-accessToken');
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user);
    } catch (error) {
        next(error);
    }
};