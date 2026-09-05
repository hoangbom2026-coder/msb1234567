/**
 * profitScheduleService.js
 *
 * Tra cứu house_edge_percent hiệu lực cho một phòng tại thời điểm hiện tại.
 * Ưu tiên (cao → thấp):
 *   1. Rule khớp đúng room_id + day_of_week + khung giờ (specific)
 *   2. Rule khớp đúng room_id + day_of_week = 7 (all-day, room specific)
 *   3. Rule fallback toàn cục (room_id không có rule nào → DEFAULT_EDGE)
 *
 * Cache 30 giây để tránh query DB mỗi giây cho mỗi phòng.
 */

import pool from '../config/database.js';

const DEFAULT_EDGE = 70; // fallback nếu không có rule nào

// Simple in-process cache: { roomId → { edge, expiresAt } }
const cache = new Map();
const CACHE_TTL_MS = 30_000;

/**
 * Trả về house_edge_percent [0-100] hiệu lực cho roomId tại thời điểm gọi.
 * 0  = hoàn toàn ngẫu nhiên
 * 100 = luôn chọn kết quả bất lợi nhất cho người chơi
 */
export const getEffectiveHouseEdge = async (roomId) => {
    const cached = cache.get(roomId);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.edge;
    }

    try {
        const now = new Date();
        const currentDay  = now.getDay();     // 0=Sun … 6=Sat
        const currentHour = now.getHours();   // 0-23 server local time

        // Fetch all active rules for this room, ordered by specificity:
        // exact day match > wildcard day (7), then exact hour range first
        const [rows] = await pool.query(
            `SELECT house_edge_percent, day_of_week
             FROM profit_schedule
             WHERE room_id = ?
               AND is_active = 1
               AND hour_from <= ?
               AND hour_to   >= ?
             ORDER BY
               CASE WHEN day_of_week = ? THEN 0 ELSE 1 END ASC,
               CASE WHEN day_of_week = 7 THEN 1 ELSE 0 END ASC
             LIMIT 1`,
            [roomId, currentHour, currentHour, currentDay]
        );

        const edge = rows.length > 0 ? parseInt(rows[0].house_edge_percent, 10) : DEFAULT_EDGE;

        cache.set(roomId, { edge, expiresAt: Date.now() + CACHE_TTL_MS });
        return edge;
    } catch (err) {
        console.error('[ProfitSchedule] DB error, using default edge:', err.message);
        return DEFAULT_EDGE;
    }
};

/**
 * Xoá cache cho một room (gọi khi admin cập nhật schedule).
 */
export const invalidateCache = (roomId = null) => {
    if (roomId !== null) {
        cache.delete(roomId);
    } else {
        cache.clear();
    }
};
