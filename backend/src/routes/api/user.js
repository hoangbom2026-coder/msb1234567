import express from 'express';
import * as userController from '../../controllers/userController.js';
import * as transactionController from '../../controllers/transactionController.js';
import * as cskhController from '../../controllers/cskhController.js';
import { verifyToken } from '../../middleware/authMiddleware.js';
import { upload, optimizeUploadedImage } from '../../middleware/uploadMiddleware.js';

const router = express.Router();

// ─── Public routes (no auth required) ────────────────────────────────────────
router.get('/getBanner',         userController.getBanners);
router.get('/listbank',          userController.listSystemBanks);
router.get('/notification/home', userController.getHomeNotifications);
router.get('/chat/guest/history', cskhController.getGuestChatHistory);
router.post('/chat/upload/guest', upload.single('chat'), optimizeUploadedImage, cskhController.uploadChatImage);

// ─── Protected routes (verifyToken applied per-route because /user is mixed public/private) ──
router.get('/profile',        verifyToken, userController.getUserInfo);
router.get('/userInfo',       verifyToken, userController.getUserInfo);
router.post('/updateProfile', verifyToken, userController.updateProfile);
router.get('/notification/all', verifyToken, userController.getAllNotifications);

router.get('/vip/info',  verifyToken, userController.get_vip_info);
router.get('/vip/list',  verifyToken, userController.get_vip_list);

router.get('/chat/history',  verifyToken, cskhController.getChatHistory);
router.post('/chat/upload',  verifyToken, upload.single('chat'), cskhController.uploadChatImage);

router.post('/addbanking',                verifyToken, userController.addBanking);
router.get('/getBanking',                 verifyToken, userController.getBanking);
router.put('/change/password',            verifyToken, userController.changePassword);
router.put('/change/password-transaction',verifyToken, userController.changePasswordV2);
router.put('/change/password-direct',     verifyToken, userController.changePasswordDirect);

router.get('/bet-history',      verifyToken, userController.getBetHistory);
router.get('/deposit/history',  verifyToken, transactionController.getDepositHistory);
router.get('/withdraw/history', verifyToken, transactionController.getWithdrawHistory);

// NOTE: POST /user/deposit and GET|POST /user/withdraw are DEPRECATED aliases.
// Canonical endpoints are POST /api/transaction/recharge and POST /api/transaction/withdraw.
// Kept for backwards-compatibility with existing frontend until next release.
router.post('/deposit',  verifyToken, upload.single('image'), transactionController.requestDeposit);
router.get('/withdraw',  verifyToken, transactionController.getWithdrawHistory);
router.post('/withdraw', verifyToken, transactionController.requestWithdraw);

export default router;
