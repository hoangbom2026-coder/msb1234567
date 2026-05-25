import pool from '../config/database.js';

/**
 * Race Condition Fix Service
 * Sử dụng optimistic locking để xử lý concurrent bets
 */

const MAX_RETRIES = 3;
const RETRY_DELAY = 100; // milliseconds

/**
 * Retry wrapper với exponential backoff
 */
const withRetry = async (fn, retries = MAX_RETRIES) => {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0 && error.code === 'ER_LOCK_DEADLOCK') {
            // Deadlock detected, retry
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1)));
            return withRetry(fn, retries - 1);
        }
        throw error;
    }
};

/**
 * Create bet with optimistic locking to prevent race condition
 * Sử dụng version column để detect concurrent updates
 */
export const createBetWithLocking = async (userId, sessionId, roomId, betCode, amount, odds) => {
    return withRetry(async () => {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // 1. Get user's current balance và version
            const [userRows] = await conn.query(
                'SELECT id, money, version FROM users WHERE id = ? FOR UPDATE',
                [userId]
            );

            if (userRows.length === 0) {
                throw new Error('Người dùng không tồn tại');
            }

            const user = userRows[0];
            const currentVersion = user.version || 0;

            // 2. Kiểm tra balance
            if (parseFloat(user.money) < parseFloat(amount)) {
                throw new Error('Số dư không đủ');
            }

            // 3. Trừ tiền với version update (optimistic lock)
            // Nếu version bị thay đổi bởi request khác, UPDATE sẽ không ảnh hưởng đến dòng nào
            const [updateResult] = await conn.query(
                'UPDATE users SET money = money - ?, version = version + 1 WHERE id = ? AND version = ?',
                [amount, userId, currentVersion]
            );

            // Kiểm tra xem update có thành công không (affected rows > 0)
            if (updateResult.affectedRows === 0) {
                // Version mismatch - concurrent update detected, rollback and retry
                throw new Error('ER_LOCK_DEADLOCK'); // Simulate deadlock untuk retry
            }

            // 4. Create bet record
            const [sessionRows] = await conn.query(
                'SELECT period FROM game_sessions WHERE id = ?',
                [sessionId]
            );

            if (sessionRows.length === 0) {
                throw new Error('Phiên game không tồn tại');
            }

            const period = sessionRows[0].period || '';

            const [result] = await conn.query(
                'INSERT INTO bets (user_id, session_id, period, room_id, bet_value, amount, odds, status, time) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)',
                [userId, sessionId, period, roomId, betCode, amount, odds, Date.now()]
            );

            const betId = result.insertId;

            await conn.commit();

            return {
                id: betId,
                userId,
                sessionId,
                period,
                amount,
                odds,
                status: 0
            };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    });
};

/**
 * Alternative: Pessimistic locking (nếu cần thêm bền)
 * Khóa row user cho đến khi transaction kết thúc
 */
export const createBetWithPessimisticLocking = async (userId, sessionId, roomId, betCode, amount, odds) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Lock user row ngay từ đầu (SELECT ... FOR UPDATE)
        const [userRows] = await conn.query(
            'SELECT money FROM users WHERE id = ? FOR UPDATE',
            [userId]
        );

        if (userRows.length === 0) {
            throw new Error('Người dùng không tồn tại');
        }

        const user = userRows[0];

        // 2. Kiểm tra balance
        if (parseFloat(user.money) < parseFloat(amount)) {
            throw new Error('Số dư không đủ');
        }

        // 3. Trừ tiền
        await conn.query(
            'UPDATE users SET money = money - ? WHERE id = ?',
            [amount, userId]
        );

        // 4. Create bet
        const [sessionRows] = await conn.query(
            'SELECT period FROM game_sessions WHERE id = ?',
            [sessionId]
        );

        const period = sessionRows[0]?.period || '';

        const [result] = await conn.query(
            'INSERT INTO bets (user_id, session_id, period, room_id, bet_value, amount, odds, status, time) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)',
            [userId, sessionId, period, roomId, betCode, amount, odds, Date.now()]
        );

        const betId = result.insertId;

        await conn.commit();

        return {
            id: betId,
            userId,
            sessionId,
            period,
            amount,
            odds,
            status: 0
        };

    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

/**
 * Kiểm tra và thống kê concurrent issues
 */
export const getConcurrentBetStats = async (userId, minutes = 5) => {
    try {
        const since = Date.now() - (minutes * 60 * 1000);

        const [stats] = await pool.query(
            `SELECT 
        COUNT(*) as total_bets,
        SUM(amount) as total_amount,
        COUNT(DISTINCT session_id) as unique_sessions,
        MIN(time) as first_bet_time,
        MAX(time) as last_bet_time
       FROM bets 
       WHERE user_id = ? AND time >= ?`,
            [userId, since]
        );

        return stats[0] || {};
    } catch (err) {
        console.error('[CONCURRENT STATS ERROR]', err);
        return {};
    }
};
