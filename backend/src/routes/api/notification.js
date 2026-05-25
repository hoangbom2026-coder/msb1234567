import express from 'express';
import * as notificationController from '../../controllers/notificationController.js';
import { verifyToken } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Lấy danh sách thông báo
router.get('/list', verifyToken, notificationController.getNotifications);

// Đánh dấu đã đọc thông báo
router.post('/read', verifyToken, notificationController.readNotifications);

export default router;
