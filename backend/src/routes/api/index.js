import express from 'express';
import rateLimit from 'express-rate-limit';
import authRoutes from './auth.js';
import userRoutes from './user.js';
import gameRoutes from './game.js';
import transactionRoutes from './transaction.js';
import adminRoutes from './admin.js';
import bankRoutes from './bank.js';
import configRoutes from './config.js';
import betRoutes from './bet.js';
import notificationRoutes from './notification.js';
import pool from '../../config/database.js';

import { verifyToken, isStaff } from '../../middleware/authMiddleware.js';

const router = express.Router();

// ─── Rate limiters ────────────────────────────────────────────────────────────

// Login: max 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: false, message: 'Quá nhiều lần đăng nhập, vui lòng thử lại sau 15 phút' },
    skipSuccessfulRequests: true,
});

// Withdraw: max 10 requests per 10 minutes per IP
const withdrawLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: false, message: 'Quá nhiều yêu cầu rút tiền, vui lòng thử lại sau' },
});

// Bet: max 120 requests per minute per IP (high-frequency but bounded)
const betLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: false, message: 'Quá nhiều yêu cầu đặt cược, vui lòng chờ' },
});

// ─── Health endpoint ──────────────────────────────────────────────────────────

router.get('/health', async (_req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: true, db: 'ok', uptime: Math.floor(process.uptime()), ts: Date.now() });
    } catch {
        res.status(503).json({ status: false, db: 'error' });
    }
});

// ─── Mount routes ─────────────────────────────────────────────────────────────

router.use('/auth', authRoutes);                         // loginLimiter applied inside auth.js
router.post('/auth/login', loginLimiter);                // pre-mount guard (runs first due to Express ordering)
router.use('/game', gameRoutes);
router.use('/bet', verifyToken, betLimiter, betRoutes);
router.use('/user', userRoutes);
router.use('/transaction', verifyToken, transactionRoutes);
router.use('/admin', verifyToken, isStaff, adminRoutes);
router.use('/banks', bankRoutes);
router.use('/config', configRoutes);
router.use('/notification', notificationRoutes);

export default router;
