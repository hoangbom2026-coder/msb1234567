/**
 * profitScheduleController.js
 *
 * CRUD cho bảng profit_schedule — chỉ dành cho admin.
 * Mỗi rule định nghĩa: phòng + ngày trong tuần + khung giờ → house_edge_percent.
 */

import pool from '../config/database.js';
import { sendResponse } from '../utils/helpers.js';
import { invalidateCache } from '../services/profitScheduleService.js';

// ─── GET all rules (có thể lọc theo room_id) ────────────────────────────────
export const getSchedules = async (req, res, next) => {
    try {
        const { room_id } = req.query;
        let sql = `
            SELECT ps.*, gr.name as room_name, gr.game_id, gr.type as room_type
            FROM profit_schedule ps
            JOIN game_rooms gr ON ps.room_id = gr.id
            WHERE ps.is_active = 1
        `;
        const params = [];
        if (room_id) {
            sql += ' AND ps.room_id = ?';
            params.push(parseInt(room_id));
        }
        sql += ' ORDER BY ps.room_id, ps.day_of_week, ps.hour_from';

        const [rows] = await pool.query(sql, params);
        return sendResponse(res, true, 'Thành công', rows);
    } catch (err) { next(err); }
};

// ─── GET all active game rooms (for UI dropdown) ─────────────────────────────
export const getRoomsForSchedule = async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, name, game_id, type FROM game_rooms WHERE status = 1 ORDER BY sort_order ASC'
        );
        return sendResponse(res, true, 'Thành công', rows);
    } catch (err) { next(err); }
};

// ─── CREATE a new rule ────────────────────────────────────────────────────────
export const createSchedule = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        const { room_id, day_of_week, hour_from, hour_to, house_edge_percent, note } = req.body;

        // Validate
        if (room_id === undefined || room_id === null) {
            return sendResponse(res, false, 'room_id là bắt buộc');
        }
        const edge = parseInt(house_edge_percent);
        if (isNaN(edge) || edge < 0 || edge > 100) {
            return sendResponse(res, false, 'house_edge_percent phải từ 0 đến 100');
        }
        const dow = parseInt(day_of_week);
        if (isNaN(dow) || dow < 0 || dow > 7) {
            return sendResponse(res, false, 'day_of_week: 0-6 (Cn-T7) hoặc 7 (tất cả ngày)');
        }
        const hFrom = parseInt(hour_from);
        const hTo   = parseInt(hour_to);
        if (isNaN(hFrom) || isNaN(hTo) || hFrom < 0 || hTo > 23 || hFrom > hTo) {
            return sendResponse(res, false, 'hour_from/hour_to không hợp lệ (0-23, from ≤ to)');
        }

        // Check room exists
        const [[room]] = await pool.query('SELECT id FROM game_rooms WHERE id = ?', [parseInt(room_id)]);
        if (!room) return sendResponse(res, false, 'Phòng không tồn tại');

        const now = Date.now();
        const [result] = await pool.query(
            `INSERT INTO profit_schedule
             (room_id, day_of_week, hour_from, hour_to, house_edge_percent, note, is_active, created_by, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
            [parseInt(room_id), dow, hFrom, hTo, edge, note || null, adminId, now, now]
        );

        invalidateCache(parseInt(room_id));
        return sendResponse(res, true, 'Tạo rule thành công', { id: result.insertId });
    } catch (err) { next(err); }
};

// ─── UPDATE an existing rule ─────────────────────────────────────────────────
export const updateSchedule = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { day_of_week, hour_from, hour_to, house_edge_percent, note, is_active } = req.body;

        const [[existing]] = await pool.query('SELECT * FROM profit_schedule WHERE id = ?', [parseInt(id)]);
        if (!existing) return sendResponse(res, false, 'Rule không tồn tại');

        const edge  = house_edge_percent !== undefined ? parseInt(house_edge_percent) : existing.house_edge_percent;
        const dow   = day_of_week        !== undefined ? parseInt(day_of_week)        : existing.day_of_week;
        const hFrom = hour_from          !== undefined ? parseInt(hour_from)          : existing.hour_from;
        const hTo   = hour_to            !== undefined ? parseInt(hour_to)            : existing.hour_to;
        const active = is_active         !== undefined ? (is_active ? 1 : 0)          : existing.is_active;

        if (edge < 0 || edge > 100)          return sendResponse(res, false, 'house_edge_percent phải từ 0 đến 100');
        if (dow < 0 || dow > 7)              return sendResponse(res, false, 'day_of_week: 0-6 hoặc 7');
        if (hFrom < 0 || hTo > 23 || hFrom > hTo) return sendResponse(res, false, 'Khung giờ không hợp lệ');

        await pool.query(
            `UPDATE profit_schedule
             SET day_of_week=?, hour_from=?, hour_to=?, house_edge_percent=?, note=?, is_active=?, updated_at=?
             WHERE id=?`,
            [dow, hFrom, hTo, edge, note !== undefined ? note : existing.note, active, Date.now(), parseInt(id)]
        );

        invalidateCache(existing.room_id);
        return sendResponse(res, true, 'Cập nhật thành công');
    } catch (err) { next(err); }
};

// ─── DELETE (soft-delete: is_active = 0) ─────────────────────────────────────
export const deleteSchedule = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [[existing]] = await pool.query('SELECT room_id FROM profit_schedule WHERE id = ?', [parseInt(id)]);
        if (!existing) return sendResponse(res, false, 'Rule không tồn tại');

        await pool.query('UPDATE profit_schedule SET is_active = 0, updated_at = ? WHERE id = ?', [Date.now(), parseInt(id)]);
        invalidateCache(existing.room_id);
        return sendResponse(res, true, 'Đã xoá rule');
    } catch (err) { next(err); }
};

// ─── GET current effective edge per room (live preview) ──────────────────────
export const getLiveEdgePreview = async (req, res, next) => {
    try {
        const now = new Date();
        const currentDay  = now.getDay();
        const currentHour = now.getHours();

        const [rooms] = await pool.query('SELECT id, name, game_id, type FROM game_rooms WHERE status = 1');

        const results = await Promise.all(rooms.map(async (room) => {
            const [rows] = await pool.query(
                `SELECT house_edge_percent, day_of_week, hour_from, hour_to
                 FROM profit_schedule
                 WHERE room_id = ? AND is_active = 1 AND hour_from <= ? AND hour_to >= ?
                 ORDER BY
                   CASE WHEN day_of_week = ? THEN 0 ELSE 1 END ASC,
                   CASE WHEN day_of_week = 7 THEN 1 ELSE 0 END ASC
                 LIMIT 1`,
                [room.id, currentHour, currentHour, currentDay]
            );
            return {
                room_id: room.id,
                room_name: room.name,
                game_id: room.game_id,
                type: room.type,
                current_house_edge: rows.length > 0 ? rows[0].house_edge_percent : 70,
                matched_rule: rows[0] || null,
                current_day: currentDay,
                current_hour: currentHour,
            };
        }));

        return sendResponse(res, true, 'Live preview', results);
    } catch (err) { next(err); }
};
