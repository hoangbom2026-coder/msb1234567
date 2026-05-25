import express from 'express';
import * as betController from '../../controllers/betController.js';
import { verifyToken } from '../../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/bet
// @desc    Place a new bet
// @access  Private
router.post('/', verifyToken, betController.placeBet);

export default router;
