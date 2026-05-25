import express from 'express';
import * as bankController from '../../controllers/bankController.js';
import { verifyToken } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Public route to get the list of all supported banks
router.get('/', bankController.getAllBanks);

// Protected route to get the user's linked bank accounts
router.get('/user', verifyToken, bankController.getUserBanks);

// Protected route to add a new bank account
router.post('/add', verifyToken, bankController.addUserBank);

export default router;
