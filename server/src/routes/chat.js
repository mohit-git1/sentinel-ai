const express = require('express');
const router = express.Router();
const chatService = require('../services/chatService');
const authMiddleware = require('../middleware/auth');

router.post('/:prId', authMiddleware, async (req, res, next) => {
    try {
        const { message, history } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        const reply = await chatService.chatWithAI(req.params.prId, message, history || []);
        res.json({ reply });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
