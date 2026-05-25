import pool from '../config/database.js';
import { sendResponse } from '../utils/helpers.js';

/**
 * Lấy danh sách các sảnh game đang hoạt động
 */
export const getRooms = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, game_id, name, image_url, type, cycle_seconds, bet_close_seconds, odds, config, sort_order, status FROM game_rooms WHERE status = 1 ORDER BY sort_order ASC'
    );
    return sendResponse(res, true, 'Lấy danh sách sảnh game thành công', rows);
  } catch (err) {
    console.error('[GAME ERROR] getRooms failed:', err.message);
    next(err);
  }
};

/**
 * Lấy danh sách banner quảng cáo (Public)
 */
export const getBanners = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM banners WHERE status = 1 ORDER BY sort_order ASC');
    return sendResponse(res, true, 'Thành công', rows);
  } catch (err) { next(err); }
};

/**
 * Lấy lịch sử kết quả của một trò chơi
 */
export const getGameResults = async (req, res, next) => {
  try {
    const gameIdFromQuery = req.query.game_id || req.query.gameId;
    const limit = req.query.limit || 50;

    if (!gameIdFromQuery) return sendResponse(res, false, 'Thiếu game_id');

    const [rows] = await pool.query(
      `SELECT s.period, s.result, s.total_payout, s.end_time 
       FROM game_sessions s
       JOIN game_rooms r ON s.room_id = r.id
       WHERE r.game_id = ? AND s.status = 2
       ORDER BY s.end_time DESC LIMIT ?`,
      [gameIdFromQuery, parseInt(limit)]
    );
    
    return sendResponse(res, true, 'Thành công', rows);
  } catch (err) { 
    console.error('[GAME ERROR] getGameResults failed:', err.message);
    next(err); 
  }
};

/**
 * Lấy phiên hiện tại của một trò chơi
 */
export const getCurrentSession = async (req, res, next) => {
  try {
    const { game_id } = req.query;
    if (!game_id) return sendResponse(res, false, 'Thiếu game_id');

    const [rows] = await pool.query(
      `SELECT s.*, r.name as room_name, r.type as room_type
       FROM game_sessions s
       JOIN game_rooms r ON s.room_id = r.id
       WHERE r.game_id = ? AND s.status = 0
       ORDER BY s.end_time ASC LIMIT 1`,
      [game_id]
    );

    if (rows.length === 0) return sendResponse(res, false, 'Không có phiên nào đang mở');

    return sendResponse(res, true, 'Thành công', rows[0]);
  } catch (err) { next(err); }
};

/**
 * Lấy tỷ lệ cược (Odds) của trò chơi
 */
export const getGameOdds = async (req, res, next) => {
  try {
    const { game_id } = req.query;
    if (!game_id) return sendResponse(res, false, 'Thiếu game_id');

    const [rows] = await pool.query('SELECT odds FROM game_rooms WHERE game_id = ?', [game_id]);
    if (rows.length === 0) return sendResponse(res, false, 'Không tìm thấy game');

    return sendResponse(res, true, 'Thành công', rows[0].odds);
  } catch (err) { next(err); }
};

/**
 * Láy thông tin khởi tạo cho trang Betting (Room + Current Session + Last Result)
 */
export const getGameInitData = async (req, res, next) => {
  try {
    const { game_id } = req.params;
    if (!game_id) return sendResponse(res, false, 'Thiếu game_id');

    // 1. Get Room
    const [rooms] = await pool.query('SELECT * FROM game_rooms WHERE game_id = ?', [game_id]);
    if (rooms.length === 0) return sendResponse(res, false, 'Không tìm thấy game');
    const room = rooms[0];

    // 2. Get Current Session
    const [sessions] = await pool.query(
      'SELECT * FROM game_sessions WHERE room_id = ? AND status = 0 ORDER BY end_time ASC LIMIT 1',
      [room.id]
    );

    // 3. Get Last Result
    const [results] = await pool.query(
      'SELECT result FROM game_sessions WHERE room_id = ? AND status = 2 ORDER BY end_time DESC LIMIT 1',
      [room.id]
    );

    return sendResponse(res, true, 'Thành công', {
      room,
      currentSession: sessions.length > 0 ? sessions[0] : null,
      lastResult: results.length > 0 ? (typeof results[0].result === 'string' ? JSON.parse(results[0].result) : results[0].result) : []
    });
  } catch (err) { next(err); }
};

/**
 * Diagnostic info
 */
export const getDiagnostic = async (req, res, next) => {
  try {
    const [rooms] = await pool.query('SELECT game_id, name, status FROM game_rooms');
    const [recentSessions] = await pool.query('SELECT period, status, end_time FROM game_sessions ORDER BY id DESC LIMIT 5');
    
    return sendResponse(res, true, 'Diagnostic Data', {
      server_time: Date.now(),
      rooms,
      recent_sessions: recentSessions
    });
  } catch (err) { next(err); }
};
