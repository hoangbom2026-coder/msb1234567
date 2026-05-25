import pool from '../config/database.js';
import { createBetWithPessimisticLocking } from '../services/racingConditionFix.js';
import { logTransaction } from '../middleware/transactionLogger.js';

/**
 * Retrieves all bets for a specific game session.
 */
export const getBetsBySession = async (sessionId, connection = pool) => {
    const [rows] = await connection.query('SELECT * FROM bets WHERE session_id = ?', [sessionId]);
    return rows;
};

/**
 * Updates the status and win amount of a bet after a session is resolved.
 */
export const updateBetStatus = async (betId, status, winAmount, connection = pool) => {
    await connection.query('UPDATE bets SET status = ?, win_amount = ? WHERE id = ?', [status, winAmount, betId]);
};

/**
 * Creates a new bet with race condition protection
 * Sử dụng pessimistic locking để tránh concurrent issues
 */
export const createBet = async (userId, sessionId, roomId, betCode, amount, odds) => {
    try {
        const result = await createBetWithPessimisticLocking(userId, sessionId, roomId, betCode, amount, odds);

        // Log successful bet
        logTransaction({
            type: 'bet',
            userId,
            amount,
            orderId: `BET-${result.id}`,
            status: 'success',
            description: 'Đặt cược thành công',
            extraData: {
                betCode,
                odds,
                period: result.period
            }
        });

        return result;
    } catch (error) {
        // Log failed bet
        logTransaction({
            type: 'bet',
            userId,
            amount,
            status: 'failed',
            description: `Lỗi đặt cược: ${error.message}`,
            extraData: {
                betCode,
                error: error.message
            }
        });

        console.error(`Failed to create bet for user ${userId}:`, error);
        throw error;
    }
};

