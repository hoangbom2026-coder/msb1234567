import express from 'express';
import pool from '../../config/database.js';

const router = express.Router();

// @route   GET /api/config/system
// @desc    Get system configurations
router.get('/system', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT config_key, config_value FROM system_config');
        const config = rows.reduce((acc, cur) => {
            acc[cur.config_key] = cur.config_value;
            return acc;
        }, {});
        res.status(200).json({ status: true, data: config });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
});

const depositConfig = {
    cskh_url: "https://t.me/your_support_bot",
    min_deposit: 100,
    max_deposit: 10000,
    currency_symbol: "USDT"
};

router.get('/deposit-info', (req, res) => {
    res.status(200).json({ status: true, data: depositConfig });
});

export default router;
