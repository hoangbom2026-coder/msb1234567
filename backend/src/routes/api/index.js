import express from 'express';
import authRoutes from './auth.js';
import userRoutes from './user.js';
import gameRoutes from './game.js';
import transactionRoutes from './transaction.js';
import adminRoutes from './admin.js';
import bankRoutes from './bank.js';
import configRoutes from './config.js';
import betRoutes from './bet.js';
import notificationRoutes from './notification.js';

// Import middlewares
import { verifyToken, isStaff } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/game', gameRoutes); 
router.use('/bet', verifyToken, betRoutes);
router.use('/user', userRoutes); // middleware handles internally in user.js for mix of public/private
router.use('/transaction', verifyToken, transactionRoutes);
router.use('/admin', verifyToken, isStaff, adminRoutes);
router.use('/banks', bankRoutes);
router.use('/config', configRoutes);
router.use('/notification', notificationRoutes);

export default router;
