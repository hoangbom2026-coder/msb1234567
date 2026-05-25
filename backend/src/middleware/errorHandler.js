export const errorHandler = (err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi hệ thống';

  res.status(statusCode).json({
    status: false,
    message: message,
    // stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
