import axios from 'axios';
import pool from '../config/database.js';

// Cache Telegram config for 60s to avoid a DB round-trip on every notification
let _configCache = null;
let _configCachedAt = 0;
const CONFIG_TTL_MS = 60_000;

const getTelegramConfig = async () => {
    if (_configCache && Date.now() - _configCachedAt < CONFIG_TTL_MS) {
        return _configCache;
    }
    const [rows] = await pool.query(
        'SELECT config_key, config_value FROM system_config WHERE config_key IN ("tg_bot_token", "tg_admin_chat_id")'
    );
    const cfg = rows.reduce((acc, r) => { acc[r.config_key] = r.config_value; return acc; }, {});
    _configCache = cfg;
    _configCachedAt = Date.now();
    return cfg;
};

/**
 * Fire-and-forget Telegram notification.
 * Never throws — a Telegram failure must never break a business operation.
 * Logs errors to console for visibility.
 */
export const sendTelegramAdmin = async (message) => {
    try {
        const config = await getTelegramConfig();
        const { tg_bot_token: botToken, tg_admin_chat_id: chatId } = config;

        if (!botToken || !chatId) {
            console.warn('[TELEGRAM] Bot token or chat ID not configured — skipping notification.');
            return;
        }

        await axios.post(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            { chat_id: chatId, text: message, parse_mode: 'HTML' },
            { timeout: 5000 }   // 5s max — never hang the caller
        );
    } catch (err) {
        // Log but never propagate — Telegram outages must not affect game logic
        console.error('[TELEGRAM ERROR]', err.response?.data || err.message);
    }
};
