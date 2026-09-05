import pool from '../config/database.js';

/**
 * Race Condition Fix Service — Pessimistic locking for concurrent bets.
 * Locks the user row for the duration of the transaction to prevent
 * double-spend / negative-balance issues under concurrent requests.
 */

/**
 * Create a bet with pessimistic locking.
 * Uses SELECT … FOR UPDATE to hold a row-level lock until commit/rollback,
 * guaranteeing balance consistency across concurrent requests.
 */
export const createBetWithPessimisticLocking = async (userId, sessionId, roomId, betCode, amount, odds) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Lock user row for the duration of this transaction
        const [userRows] = await conn.query(
            'SELECT money FROM users WHERE id = ? FOR UPDATE',
            [userId]
        );

        if (userRows.length === 0) {
            throw new Error('Người dùng không tồn tại');
        }

        if (parseFloat(userRows[0].money) < parseFloat(amount)) {
            throw new Error('Số dư không đủ');
        }

        await conn.query(
            'UPDATE users SET money = money - ? WHERE id = ?',
            [amount, userId]
        );

        const [sessionRows] = await conn.query(
            'SELECT period FROM game_sessions WHERE id = ?',
            [sessionId]
        );

        const period = sessionRows[0]?.period || '';

        const [result] = await conn.query(
            'INSERT INTO bets (user_id, session_id, period, room_id, bet_value, amount, odds, status, time) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)',
            [userId, sessionId, period, roomId, betCode, amount, odds, Date.now()]
        );

        await conn.commit();

        return { id: result.insertId, userId, sessionId, period, amount, odds, status: 0 };

    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};
