/**
 * Middleware to handle 404 Not Found errors.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    error.status = "ROUTE NOT FOUND";
    next(error);
  };
  
  const errorHandler  = (err, req, res, next) => {
    const statusCode = err.statusCode ? err.statusCode : 500;
  
    res.status(statusCode).json({
      status: err.status ? err.status : "INTERNAL SERVER ERROR",
      error: {
        message: err.message,
        identifier:
          process.env.NODE_ENV === "development" ? err.identifier : undefined,
      },
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  };
  
  module.exports = { notFound, errorHandler };
  