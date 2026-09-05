import express from 'express';
import rateLimit from 'express-rate-limit';
import * as transactionController from '../../controllers/transactionController.js';
import { upload, optimizeUploadedImage } from '../../middleware/uploadMiddleware.js';

const router = express.Router();

// verifyToken is already applied at mount level in routes/api/index.js
// — do NOT add it again here (would run twice)

const withdrawLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: false, message: 'Quá nhiều yêu cầu rút tiền, vui lòng thử lại sau' },
});

router.post('/recharge', upload.single('proof'), optimizeUploadedImage, transactionController.requestDeposit);
router.post('/withdraw', withdrawLimiter, transactionController.requestWithdraw);
router.get('/history', transactionController.getHistory);

export default router;
