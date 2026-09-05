import express from 'express';
import * as adminController from '../../controllers/adminController.js';
import * as cskhController from '../../controllers/cskhController.js';
import * as notificationController from '../../controllers/notificationController.js';
import * as profitScheduleController from '../../controllers/profitScheduleController.js';
import { upload } from '../../middleware/uploadMiddleware.js';
import { verifyToken, isAdmin, isAgent, isCSKH, isStaff } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Dashboard Stats
router.get('/stats', isStaff, adminController.getDashboardStats);
router.get('/top-players', isStaff, adminController.getTopPlayers);

// User Management
router.get('/users', isStaff, adminController.getUsers);
router.post('/users/status', isAdmin, adminController.updateUserStatus); // Only admin can block
router.post('/users/role', isAdmin, adminController.updateUserRole);
router.post('/users/update', isAdmin, adminController.updateUser);
router.post('/users/adjust-balance', isAdmin, adminController.adjustBalance);
router.get('/referrals', isAgent, adminController.getReferralStats); // Agent & Admin (isAgent includes admin)

// Transaction Management
router.get('/transactions', isCSKH, adminController.getTransactions);
router.post('/transactions/approve', isCSKH, adminController.approveTransaction);

// Game Management
router.get('/games', isStaff, adminController.getGames);
router.post('/games/update/:game_id', isAdmin, adminController.updateGame);
router.get('/games/sessions/open', isStaff, adminController.getOpenSessions);
router.get('/games/sessions/history', isStaff, adminController.getGameHistory);
router.get('/games/bets', isStaff, adminController.getBets);
router.post('/games/set-result', isAdmin, adminController.adjustGameResult);

// Chat / Support Management
router.get('/chat/conversations', isStaff, cskhController.getAdminConversations);
router.get('/chat/messages/:id', isStaff, cskhController.getConversationMessages);
router.post('/chat/read/:id', isStaff, cskhController.markConversationAsRead);
router.post('/chat/upload', isStaff, upload.single('chat'), cskhController.uploadChatImage);

// System Config & Logs
router.get('/config', isAdmin, adminController.getSystemConfig);
router.post('/config/update', isAdmin, adminController.updateSystemConfig);
router.get('/logs', isStaff, adminController.getAuditLogs);

// Banner Management
router.get('/banners', isStaff, adminController.getBanners);
router.post('/banners/update', isAdmin, adminController.updateBanner);
router.delete('/banners/delete/:id', isAdmin, adminController.deleteBanner);

// Notifications Management
router.get('/notifications', isStaff, notificationController.getNotifications);
router.post('/notifications/create', isAdmin, notificationController.createNotification);
router.delete('/notifications/delete/:id', isAdmin, notificationController.deleteNotification);

// Invite Code Management
router.get('/invite-codes', isAgent, adminController.getInviteCodes);
router.post('/invite-codes/create', isAgent, adminController.createInviteCode);
router.post('/invite-codes/update/:id', isAgent, adminController.updateInviteCode);
router.delete('/invite-codes/delete/:id', isAgent, adminController.deleteInviteCode);

// Profit Schedule (house edge theo phòng + khung giờ)
router.get('/profit-schedule',              isAdmin, profitScheduleController.getSchedules);
router.get('/profit-schedule/rooms',        isAdmin, profitScheduleController.getRoomsForSchedule);
router.get('/profit-schedule/live-preview', isAdmin, profitScheduleController.getLiveEdgePreview);
router.post('/profit-schedule',             isAdmin, profitScheduleController.createSchedule);
router.put('/profit-schedule/:id',          isAdmin, profitScheduleController.updateSchedule);
router.delete('/profit-schedule/:id',       isAdmin, profitScheduleController.deleteSchedule);

// Security
router.post('/change-password', isAdmin, adminController.updateAdminPassword);

export default router;
