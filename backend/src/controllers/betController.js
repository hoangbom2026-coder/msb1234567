import pool from '../config/database.js';
import * as betModel from '../models/betModel.js';
import * as gameModel from '../models/gameModel.js';
import { sendTelegramAdmin } from '../utils/telegram.js';

import * as k3Logic from '../services/gameLogic/k3Logic.js';
import * as fiveDLogic from '../services/gameLogic/fiveDLogic.js';
import * as wingoLogic from '../services/gameLogic/wingoLogic.js';

/**
 * Handles the bet placement logic.
 */
export const placeBet = async (req, res, next) => {
    const { roomId, betCode, amount } = req.body;
    const userId = req.user.id;

    if (!roomId || !betCode || !amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ success: false, message: 'Thông tin đặt cược không hợp lệ.' });
    }

    try {
        // Validate amount
        if (isNaN(parseFloat(amount))) {
            return res.status(400).json({ success: false, message: 'Số tiền cược không hợp lệ.' });
        }
        // 1. Find the current open session and room details
        const [roomRows] = await pool.query('SELECT * FROM game_rooms WHERE id = ?', [roomId]);
        if (roomRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Phòng không tồn tại.' });
        }
        const room = roomRows[0];

        const latestSession = await gameModel.findLatestSession(roomId);
        if (!latestSession || latestSession.status !== 0) {
            return res.status(400).json({ success: false, message: 'Kỳ quay đã đóng, vui lòng đợi kỳ sau.' });
        }

        // Lock betting 15 seconds before session ends
        if (Date.now() > latestSession.end_time - 15000) {
            return res.status(400).json({ success: false, message: 'Thời gian đặt cược đã hết, vui lòng đợi kỳ sau.' });
        }

        // 2. Get the correct odds for this bet from JSON
        let oddsConfig = room.odds;
        if (typeof oddsConfig === 'string') {
            try { oddsConfig = JSON.parse(oddsConfig); } catch (e) { oddsConfig = {}; }
        }

        let betOdds = 1.98;
        if (room.type === 'wingo') betOdds = wingoLogic.getOdds(betCode, oddsConfig);
        else if (room.type === 'k3') betOdds = k3Logic.getOdds(betCode, oddsConfig);
        else if (room.type === '5d') betOdds = fiveDLogic.getOdds(betCode, oddsConfig);
        else if (oddsConfig) {
             betOdds = oddsConfig[betCode] || oddsConfig.common || 1.98;
        }

        // 3. Create the bet using the transactional model function
        const newBet = await betModel.createBet(userId, latestSession.id, roomId, betCode, parseFloat(amount), betOdds);

        // Notify telegram for large bets (e.g., >= 500 USDT)
        if (parseFloat(amount) >= 500) {
            sendTelegramAdmin(`
<b>⚠️ CẢNH BÁO CƯỢC LỚN</b>
━━━━━━━━━━━━━━━━━━
🎰 Trò chơi: <b>${room.name}</b>
👤 Tài khoản: <code>${req.user.phone}</code>
💰 Tiền cược: <b>${parseFloat(amount).toLocaleString()} USDT</b>
🎯 Cửa đặt: <b>${betCode.toUpperCase()}</b>
🕰 Kỳ quay: <code>#${latestSession.period}</code>
━━━━━━━━━━━━━━━━━━
<i>🚩 Cần chú ý biến động số dư của hội viên này.</i>
            `);
        }

        res.status(201).json({ success: true, message: 'Tham gia thành công', data: newBet });

    } catch (error) {
        next(error);
    }
};
