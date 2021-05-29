const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;
  //Log to console for developer
  console.log(err);

  //Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resourse not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  //Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  //Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server error',
  });

  if (err.name === 'JsonWebToken') {
    error = new ErrorResponse('Not authorized', 401);
    return error;
  }

  if (err.name === 'TokenExpiredError') {
    const message = `Please log in again`;
    error = new ErrorResponse(message, 401);
  }
};

module.exports = errorHandler;
