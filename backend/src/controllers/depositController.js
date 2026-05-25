import pool from '../config/database.js';
import * as userModel from '../models/userModel.js';

// A (very) simple in-memory store for config. In a real app, this would be in the DB.
const config = {
    cskh_url: "https://t.me/your_support_bot",
    min_deposit: 10,
    max_deposit: 10000,
    currency_symbol: "$"
};

/**
 * User-facing: Handles the creation of a new deposit request.
 */
export const requestDeposit = async (req, res) => {
    // In a real app, userId comes from token.
    const { amount } = req.body;
    const userId = req.user.id;

    // 1. Validate Input
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Proof image is required.' });
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid amount specified.' });
    }
    if (parsedAmount < config.min_deposit || parsedAmount > config.max_deposit) {
        return res.status(400).json({ success: false, message: `Amount must be between ${config.min_deposit} and ${config.max_deposit}.` });
    }

    try {
        // 2. Create Transaction Record
        const [userRows] = await pool.query('SELECT money FROM users WHERE id = ?', [userId]);
        const balanceBefore = userRows[0]?.money || 0;

        const [result] = await pool.query(
            'INSERT INTO recharge (phone, money, type, status, proof_image, proof_note, time) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.user.phone, parsedAmount, 'bank', 0, req.file.path, 'User deposit request', Date.now()]
        );

        res.status(201).json({ success: true, message: 'Deposit request submitted successfully. Awaiting approval.', transactionId: result.insertId });

    } catch (error) {
        console.error('Deposit request error:', error);
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
};

/**
 * Admin-facing: Approves a deposit and credits the user's account.
 */
export const approveDeposit = async (req, res) => {
    const { id } = req.params;
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        // 1. Get the transaction and lock the row
        const [transRows] = await conn.query('SELECT * FROM recharge WHERE id = ? AND status = 0 FOR UPDATE', [id]);
        const transaction = transRows[0];

        if (!transaction) {
            await conn.rollback();
            return res.status(404).json({ success: false, message: 'Transaction not found or already processed.' });
        }

        // 2. Update user money
        await conn.query('UPDATE users SET money = money + ? WHERE phone = ?', [transaction.money, transaction.phone]);
        
        // 3. Update the original transaction status
        await conn.query('UPDATE recharge SET status = 1 WHERE id = ?', [id]);

        await conn.commit();

        res.status(200).json({ success: true, message: `Deposit #${id} approved.` });

    } catch (error) {
        await conn.rollback();
        console.error(`Approve deposit error for #${id}:`, error);
        res.status(500).json({ success: false, message: 'An internal server error occurred during approval.' });
    } finally {
        conn.release();
    }
};

/**
 * Admin-facing: Rejects a deposit request.
 */
export const rejectDeposit = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
        return res.status(400).json({ success: false, message: 'A reason for rejection is required.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE recharge SET status = 2, proof_note = ? WHERE id = ? AND status = 0',
            [`Rejected: ${reason}`, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Transaction not found or already processed.' });
        }
        
        res.status(200).json({ success: true, message: `Deposit #${id} rejected.` });

    } catch (error) {
        console.error(`Reject deposit error for #${id}:`, error);
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
};

/**
 * Admin-facing: Gets a list of all pending deposits.
 */
export const getPendingDeposits = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM recharge WHERE status = 0 ORDER BY time ASC");
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('Get pending deposits error:', error);
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
};
