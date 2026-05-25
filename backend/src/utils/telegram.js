import axios from 'axios';
import pool from '../config/database.js';

/**
 * Gửi thông báo qua Telegram cho Quản trị viên
 */
export const sendTelegramAdmin = async (message) => {
    try {
        // Lấy cấu hình từ database
        const [rows] = await pool.query('SELECT config_key, config_value FROM system_config WHERE config_key IN ("tg_bot_token", "tg_admin_chat_id")');
        const config = rows.reduce((acc, cur) => {
            acc[cur.config_key] = cur.config_value;
            return acc;
        }, {});

        const botToken = config.tg_bot_token;
        const chatId = config.tg_admin_chat_id;

        if (!botToken || !chatId) {
            console.warn('[TELEGRAM] Chưa cấu hình Bot Token hoặc Chat ID.');
            return;
        }

        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        await axios.post(url, {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        });
        
        console.log('[TELEGRAM] Đã gửi thông báo cho Admin.');
    } catch (error) {
        console.error('[TELEGRAM ERROR]', error.response?.data || error.message);
    }
};
