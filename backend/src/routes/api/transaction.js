import express from 'express';
import * as transactionController from '../../controllers/transactionController.js';
import { verifyToken } from '../../middleware/authMiddleware.js';
import { upload, optimizeUploadedImage } from '../../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/recharge', verifyToken, upload.single('proof'), optimizeUploadedImage, transactionController.requestDeposit);
router.post('/withdraw', verifyToken, transactionController.requestWithdraw);
router.get('/history', verifyToken, transactionController.getHistory);

export default router;
