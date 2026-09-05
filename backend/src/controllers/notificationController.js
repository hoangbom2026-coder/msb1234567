import pool from '../config/database.js';
import { sendResponse } from '../utils/helpers.js';

// GET /api/notification — public (active notifications visible to all)
export const getNotifications = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, content, type, created_at FROM notifications WHERE status = 1 ORDER BY created_at DESC LIMIT 50'
    );
    return sendResponse(res, true, 'Thành công', rows);
  } catch (err) { next(err); }
};

// POST /api/admin/notifications/create — admin only
export const createNotification = async (req, res, next) => {
  try {
    const { title, content, type = 'all' } = req.body;
    if (!title || !content) {
      return sendResponse(res, false, 'title và content là bắt buộc');
    }
    const VALID_TYPES = ['all', 'user', 'system'];
    if (!VALID_TYPES.includes(type)) {
      return sendResponse(res, false, `type phải là: ${VALID_TYPES.join(', ')}`);
    }

    let user_id = req.body.user_id || null;
    if (user_id !== null) user_id = parseInt(user_id) || null;

    const now = Date.now();
    const [result] = await pool.query(
      'INSERT INTO notifications (title, content, type, user_id, status, created_at) VALUES (?, ?, ?, ?, 1, ?)',
      [title, content, type, user_id, now]
    );

    // Realtime broadcast — fire-and-forget (socket failure must not fail the insert)
    try {
      const { getIO } = await import('../config/socket.js');
      const payload = { id: result.insertId, title, content, created_at: now };
      if (type === 'all') {
        getIO().emit('newNotification', payload);
      } else if (user_id) {
        getIO().to(`user_${user_id}`).emit('newNotification', payload);
      }
    } catch (ioErr) {
      console.error('[NOTIFICATION] Socket broadcast failed:', ioErr.message);
    }

    return sendResponse(res, true, 'Đã đăng thông báo', { id: result.insertId });
  } catch (err) { next(err); }
};

// DELETE /api/admin/notifications/delete/:id — admin only
export const deleteNotification = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return sendResponse(res, false, 'ID không hợp lệ');
    await pool.query('DELETE FROM notifications WHERE id = ?', [id]);
    return sendResponse(res, true, 'Đã xóa');
  } catch (err) { next(err); }
};
