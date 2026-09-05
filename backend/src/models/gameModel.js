import pool from '../config/database.js';

export const getActiveRooms = async () => {
  const [rows] = await pool.query('SELECT * FROM game_rooms WHERE status = 1');
  return rows;
};

export const createSession = async (roomId, period, startTime, endTime) => {
  const [result] = await pool.query(
    'INSERT INTO game_sessions (room_id, period, start_time, end_time, status) VALUES (?, ?, ?, ?, ?)',
    [roomId, period, startTime, endTime, 0]
  );
  return { id: result.insertId, roomId, period, startTime, endTime, status: 0 };
};

// "Latest" = the session ending soonest in the future (ASC) so the scheduler
// picks up the oldest open session first — this is intentional for catch-up.
// betController uses this to find the *current* open session, which is also
// the earliest-ending one (there should only be one open at a time anyway).
export const findLatestSession = async (roomId) => {
    const [rows] = await pool.query(
        'SELECT s.* FROM game_sessions s WHERE s.room_id = ? AND s.status = 0 ORDER BY s.end_time ASC LIMIT 1',
        [roomId]
    );
    return rows[0] || null;
};

/**
 * Updates the result and status of a game session.
 */
export const updateSessionResult = async (sessionId, result, connection = pool) => {
    // WHERE status = 1 ensures idempotency — only process sessions in 'processing' state,
    // preventing double-payout if the scheduler races with itself.
    await connection.query(
        'UPDATE game_sessions SET result = ?, status = 2 WHERE id = ? AND status = 1',
        [JSON.stringify(result), sessionId]
    );
};
