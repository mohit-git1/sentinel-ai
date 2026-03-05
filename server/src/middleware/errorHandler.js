/**
 * Global error handler middleware.
 * Catches all unhandled errors and returns a consistent JSON response.
 * In development, the full error stack is included for debugging.
 */
const errorHandler = (err, _req, res, _next) => {
    console.error('🔥 Error:', err.message);

    const statusCode = err.statusCode || 500;
    const response = {
        error: err.message || 'Internal Server Error',
    };

    // Include stack trace in development for easier debugging
    if (process.env.NODE_ENV !== 'production') {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;
