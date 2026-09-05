import express from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../../controllers/authController.js';

const router = express.Router();

// Login: 5 attempts per 15 minutes per IP (also applied in index.js — belt and suspenders)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { status: false, message: 'Quá nhiều lần đăng nhập, vui lòng thử lại sau 15 phút' },
});

// Register: 3 new accounts per hour per IP — prevents mass account creation
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: false, message: 'Quá nhiều tài khoản tạo từ IP này, thử lại sau 1 giờ' },
});

router.post('/register', registerLimiter, authController.register);
router.post('/login',    loginLimiter,    authController.login);

export default router;
