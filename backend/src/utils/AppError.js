/**
 * AppError — typed application errors with HTTP status codes.
 * Usage:  throw new AppError('Không tìm thấy', 404)
 *         throw new AppError('Từ chối', 403, 'FORBIDDEN')
 */
export class AppError extends Error {
    constructor(message, statusCode = 500, code = null) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = code;          // optional machine-readable code e.g. 'INSUFFICIENT_BALANCE'
        this.isOperational = true; // distinguish from unexpected bugs
        Error.captureStackTrace(this, this.constructor);
    }
}

// Convenience factories
export const BadRequest  = (msg, code) => new AppError(msg, 400, code);
export const Unauthorized= (msg = 'Vui lòng đăng nhập') => new AppError(msg, 401, 'UNAUTHORIZED');
export const Forbidden   = (msg = 'Bạn không có quyền') => new AppError(msg, 403, 'FORBIDDEN');
export const NotFound    = (msg = 'Không tìm thấy')     => new AppError(msg, 404, 'NOT_FOUND');
export const Conflict    = (msg, code)                  => new AppError(msg, 409, code);
