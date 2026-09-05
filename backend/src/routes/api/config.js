import express from 'express';
import pool from '../../config/database.js';
import { getLocale } from '../../controllers/localeController.js';

const router = express.Router();

// @route   GET /api/config/locale
// @desc    Auto-detect user locale + timezone from IP (public, no auth required)
router.get('/locale', getLocale);

// Keys that are safe to expose publicly — NEVER add sensitive keys here
const PUBLIC_CONFIG_KEYS = new Set([
    'min_deposit',
    'max_deposit',
    'min_withdraw',
    'max_withdraw',
    'withdraw_fee',
    'currency_symbol',
    'cskh_url',
    'site_name',
    'maintenance_mode',
]);

// @route   GET /api/config/system
// @desc    Get whitelisted public system configurations (sensitive keys are excluded)
router.get('/system', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT config_key, config_value FROM system_config');
        const config = rows.reduce((acc, cur) => {
            if (PUBLIC_CONFIG_KEYS.has(cur.config_key)) {
                acc[cur.config_key] = cur.config_value;
            }
            return acc;
        }, {});
        res.status(200).json({ status: true, data: config });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
});

// /deposit-info — read live values from DB (same keys as PUBLIC_CONFIG_KEYS)
router.get('/deposit-info', async (req, res) => {
    try {
        const keys = ['min_deposit', 'max_deposit', 'cskh_url', 'currency_symbol'];
        const [rows] = await pool.query(
            'SELECT config_key, config_value FROM system_config WHERE config_key IN (?)',
            [keys]
        );
        const config = rows.reduce((acc, r) => { acc[r.config_key] = r.config_value; return acc; }, {});
        res.status(200).json({ status: true, data: config });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
});

export default router;
