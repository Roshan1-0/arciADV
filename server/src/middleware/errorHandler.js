/**
 * Global error handling middleware for Express.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`❌ Error [${req.method} ${req.url}]:`, err.message);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected error occurred';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
