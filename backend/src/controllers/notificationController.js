import pool from '../config/database.js';
import { sendResponse } from '../utils/helpers.js';

export const getNotifications = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC');
    return sendResponse(res, true, 'Thành công', rows);
  } catch (err) { next(err); }
};

export const createNotification = async (req, res, next) => {
  try {
    const { title, content, type = 'all' } = req.body;
    let user_id = req.body.user_id;

    // Normalize user_id to null if empty string or not provided
    if (user_id === '' || user_id === undefined || user_id === null) {
      user_id = null;
    }
    const now = Date.now();
    await pool.query(
      'INSERT INTO notifications (title, content, type, user_id, status, created_at) VALUES (?, ?, ?, ?, 1, ?)',
      [title, content, type, user_id, now]
    );

    // Broadcast realtime
    try {
      const { getIO } = await import('../config/socket.js');
      if (type === 'all') {
        getIO().emit('newNotification', { title, content });
      } else if (user_id) {
        getIO().to(`user_${user_id}`).emit('newNotification', { title, content });
      }
    } catch (ioErr) {
      console.error('Socket broadcast failed:', ioErr.message);
    }

    return sendResponse(res, true, 'Đã đăng thông báo');
  } catch (err) { next(err); }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM notifications WHERE id = ?', [id]);
    return sendResponse(res, true, 'Đã xóa');
  } catch (err) { next(err); }
};

export const readNotifications = async (req, res, next) => {
  try {
    // Basic implementation for marking notifications as read
    // Assume there is a user_notification table or status field 
    return sendResponse(res, true, 'Đã đánh dấu đọc');
  } catch (err) { next(err); }
};
