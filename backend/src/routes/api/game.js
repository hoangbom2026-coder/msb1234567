import express from 'express';
import * as gameController from '../../controllers/gameController.js';
import { verifyToken, isStaff } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/rooms', gameController.getRooms);
router.get('/banners', gameController.getBanners);
router.get('/result', gameController.getGameResults);
router.get('/current', gameController.getCurrentSession);
router.get('/odds', gameController.getGameOdds);

// Betting page init
router.get('/init/:game_id', gameController.getGameInitData);

// Diagnostic endpoint — staff only, not for public
router.get('/diagnostic', verifyToken, isStaff, gameController.getDiagnostic);

export default router;
