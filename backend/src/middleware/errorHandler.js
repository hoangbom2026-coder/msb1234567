import { AppError } from '../utils/AppError.js';

/**
 * Centralized error handler.
 * Distinguishes operational AppErrors (known, user-facing) from
 * unexpected programming errors (logged fully, hidden from client).
 */
export const errorHandler = (err, req, res, _next) => {
    // Operational errors: known, safe to expose message
    if (err instanceof AppError || err.isOperational) {
        return res.status(err.statusCode || 400).json({
            status: false,
            code: err.code || null,
            message: err.message,
            data: null,
        });
    }

    // MySQL duplicate entry
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ status: false, code: 'DUPLICATE', message: 'Dữ liệu đã tồn tại', data: null });
    }

    // Multer file errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ status: false, code: 'FILE_TOO_LARGE', message: 'File vượt quá dung lượng cho phép', data: null });
    }

    // JWT errors from verifyToken (already handled there, but just in case)
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ status: false, code: 'INVALID_TOKEN', message: 'Token không hợp lệ hoặc đã hết hạn', data: null });
    }

    // Unknown / programming errors — log fully, hide details from client
    console.error('[UNHANDLED ERROR]', err);
    return res.status(500).json({
        status: false,
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' ? 'Lỗi hệ thống, vui lòng thử lại sau' : err.message,
        data: null,
    });
};
