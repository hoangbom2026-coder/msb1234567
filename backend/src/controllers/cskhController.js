import pool from '../config/database.js';
import { sendResponse } from '../utils/helpers.js';

/**
 * Lấy lịch sử chat của người dùng
 */
export const getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Tìm cuộc hội thoại của người dùng
    const [conversations] = await pool.query(
      'SELECT id FROM chat_conversations WHERE user_id = ?',
      [userId]
    );

    if (conversations.length === 0) {
      return sendResponse(res, true, 'Chưa có cuộc hội thoại nào', []);
    }

    const conversationId = conversations[0].id;

    // 2. Lấy danh sách tin nhắn của cuộc hội thoại đó
    const [messages] = await pool.query(
      'SELECT id, sender_id, sender_role, message, created_at FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversationId]
    );

    // 3. Chuyển đổi định dạng nếu cần (Frontend mong đợi status, data)
    return sendResponse(res, true, 'Lấy lịch sử chat thành công', messages);
  } catch (err) {
    console.error('[Chat History Error]', err);
    next(err);
  }
};

/**
 * Lấy lịch sử chat của khách (Guest)
 */
export const getGuestChatHistory = async (req, res, next) => {
    try {
      const { guestId } = req.query;
      if (!guestId) return sendResponse(res, false, 'Thiếu guestId');
  
      const [conversations] = await pool.query(
        'SELECT id FROM chat_conversations WHERE guest_id = ?',
        [guestId]
      );
  
      if (conversations.length === 0) {
        return sendResponse(res, true, 'Chưa có cuộc hội thoại nào', []);
      }
  
      const conversationId = conversations[0].id;
      const [messages] = await pool.query(
        'SELECT id, sender_id, sender_role, message, created_at FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC',
        [conversationId]
      );
  
      return sendResponse(res, true, 'Lấy lịch sử chat khách thành công', messages);
    } catch (err) {
      console.error('[Guest Chat History Error]', err);
      next(err);
    }
  };

/**
 * Lấy danh sách cuộc hội thoại dành cho Admin/CSKH/Agent
 */
export const getAdminConversations = async (req, res, next) => {
  try {
    const role = req.user.role;
    let query = `
      SELECT c.*, u.phone, u.name_real, u.avatar 
      FROM chat_conversations c 
      LEFT JOIN users u ON c.user_id = u.id 
    `;
    let params = [];

    if (role === 'agent') {
      // Đại lý chỉ thấy khách thuộc mạng lưới của mình
      query += ' WHERE u.agent_id = ?';
      params.push(req.user.id);
    } else if (role === 'cskh') {
      // CSKH thấy khách thuộc Đại lý mà họ trực thuộc HOẶC thấy tất cả nếu là CSKH tổng
      if (req.user.agent_id) {
        query += ' WHERE (u.agent_id = ? OR c.user_id IS NULL)';
        params.push(req.user.agent_id);
      } else {
        // CSKH tổng thấy tất cả bao gồm cả khách vãng lai
        query += ' WHERE 1 = 1';
      }
    } else if (role === 'admin' || role === 'ROOT') {
       query += ' WHERE 1 = 1';
    }

    query += ' ORDER BY c.updated_at DESC';

    const [conversations] = await pool.query(query, params);
    return sendResponse(res, true, 'Lấy danh sách hội thoại thành công', conversations);
  } catch (err) {
    next(err);
  }
};

/**
 * Lấy tin nhắn của một cuộc hội thoại (dành cho Admin/CSKH/Agent)
 */
export const getConversationMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const role = req.user.role;

    // Kiểm tra quyền truy cập cuộc hội thoại này
    if (role !== 'admin' && role !== 'ROOT') {
      const [[conv]] = await pool.query(
        'SELECT user_id, guest_id FROM chat_conversations WHERE id = ?',
        [id]
      );

      if (!conv) {
         return sendResponse(res, false, 'Cuộc hội thoại không tồn tại');
      }

      // Nếu là Guest chat, cho phép CSKH thấy (đặc biệt là CSKH tổng)
      if (!conv.user_id) {
        if (role !== 'cskh' && role !== 'agent') {
            return sendResponse(res, false, 'Bạn không có quyền xem cuộc hội thoại khách này');
        }
        // Nếu là agent, có thể không cho xem guest? Tùy policy. 
        // Ở đây ta cho phép CSKH xem guest.
      } else {
        const [[user]] = await pool.query('SELECT agent_id FROM users WHERE id = ?', [conv.user_id]);
        const bossId = role === 'agent' ? req.user.id : req.user.agent_id;
        
        // Nếu staff có agent_id (thuộc mạng lưới), chỉ xem được người trong mạng lưới
        if (bossId && (!user || user.agent_id !== bossId)) {
          return sendResponse(res, false, 'Bạn không có quyền xem cuộc hội thoại này');
        }
      }
    }

    const [messages] = await pool.query(
      'SELECT id, sender_id, sender_role, message, created_at FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [id]
    );
    return sendResponse(res, true, 'Lấy tin nhắn thành công', messages);
  } catch (err) {
    next(err);
  }
};

/**
 * Đánh dấu cuộc hội thoại đã đọc (dành cho Admin)
 */
export const markConversationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query(
      'UPDATE chat_conversations SET has_unread_user_messages = 0 WHERE id = ?',
      [id]
    );
    return sendResponse(res, true, 'Đã đánh dấu đọc', []);
  } catch (err) {
    next(err);
  }
};

/**
 * Upload hình ảnh cho chat
 */
export const uploadChatImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendResponse(res, false, 'Vui lòng chọn ảnh');
    }
    const imageUrl = `/uploads/chat/${req.file.filename}`;
    return sendResponse(res, true, 'Upload thành công', { url: imageUrl });
  } catch (err) {
    next(err);
  }
};
