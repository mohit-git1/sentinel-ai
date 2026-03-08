const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const webhookRoutes = require('./routes/webhooks');
const reviewRoutes = require('./routes/reviews');
const repoRoutes = require('./routes/repos');
const chatRoutes = require('./routes/chat');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- Middleware ---
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));

// Webhook route needs raw body for signature verification,
// so we register it BEFORE the global JSON parser
app.use('/api/webhooks', webhookRoutes);

app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/repos', repoRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'sentinel-ai' });
});

// --- Global Error Handler ---
app.use(errorHandler);

module.exports = app;
