import pool from '../config/database.js';
import * as helpers from '../utils/helpers.js';
import bcrypt from 'bcrypt';

const sendResponse = helpers.sendResponse;

/**
 * API Lấy Profile chuẩn hóa: UID, VIP, Balance, Today Stats, Avatar
 */
export const getUserInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const [rows] = await pool.query(
      `SELECT 
        u.id, u.phone, u.name_real, u.name_user, u.money, u.level, u.role, u.code, u.avatar,
        IFNULL(ds.total_bet, 0) as today_bet,
        IFNULL(ds.total_win, 0) as today_win
       FROM users u
       LEFT JOIN daily_stats ds ON u.id = ds.user_id AND ds.stat_date = ?
       WHERE u.id = ?`,
      [today, userId]
    );

    if (rows.length === 0) return sendResponse(res, false, 'Người dùng không tồn tại');

    const user = rows[0];

    const data = {
      id: user.id,
      uid: user.id,
      phone: user.phone,
      username: user.name_user,
      fullName: user.name_real || user.name_user || user.phone,
      role: user.role,
      money: parseFloat(user.money),
      balance: parseFloat(user.money),
      level: user.level,
      vip: user.level,
      inviteCode: user.code,
      avatar: user.avatar || '/images/default-avatar.png',
      todayBet: parseFloat(user.today_bet),
      todayWin: parseFloat(user.today_win),
      todayProfit: parseFloat(user.today_win) - parseFloat(user.today_bet)
    };

    return sendResponse(res, true, 'Lấy thông tin thành công', data);
  } catch (err) { next(err); }
};

/**
 * VIP Info
 */
export const get_vip_info = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [userRows] = await pool.query('SELECT level, money_bet_total FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) return sendResponse(res, false, 'Người dùng không tồn tại');

    const user = userRows[0];
    const [vipRows] = await pool.query('SELECT * FROM vip_levels ORDER BY id ASC');

    const currentVip = vipRows.find(v => v.id === user.level) || (vipRows.length > 0 ? vipRows[0] : null);
    const nextVip = vipRows.find(v => v.id === user.level + 1);

    return sendResponse(res, true, 'Lấy thông tin VIP thành công', {
      current_level: user.level,
      money_bet_total: parseFloat(user.money_bet_total || 0),
      current_vip: currentVip,
      next_vip: nextVip,
      all_levels: vipRows
    });
  } catch (err) { next(err); }
};

export const getBanners = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM banners WHERE status = 1 ORDER BY sort_order ASC');
    return sendResponse(res, true, 'Lấy danh sách banner thành công', rows);
  } catch (err) { next(err); }
};

export const get_vip_list = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vip_levels ORDER BY id ASC');
    return sendResponse(res, true, 'Lấy danh sách VIP thành công', rows);
  } catch (err) { next(err); }
};

export const listSystemBanks = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, bank_name as name_bank, account_number, account_name as owner_name FROM system_banks WHERE status = 1');
    return sendResponse(res, true, 'Thành công', rows);
  } catch (err) { next(err); }
};

export const getHomeNotifications = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM notifications WHERE type = 'all' AND status = 1 ORDER BY created_at DESC LIMIT 5"
    );
    return sendResponse(res, true, 'Lấy thông báo trang chủ thành công', rows);
  } catch (err) { next(err); }
};

export const getAllNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT * FROM notifications 
       WHERE type = 'all' OR (type = 'user' AND user_id = ?)
       ORDER BY created_at DESC`,
      [userId]
    );
    return sendResponse(res, true, 'Lấy tất cả thông báo thành công', rows);
  } catch (err) { next(err); }
};

export const addBanking = async (req, res, next) => {
  try {
    const { nameBank, accountNumber, ownerName } = req.body;
    const userId = req.user.id;

    if (!nameBank || !accountNumber || !ownerName) {
      return sendResponse(res, false, 'Vui lòng nhập đầy đủ thông tin ngân hàng');
    }

    const cleanOwner = ownerName.trim().toUpperCase();

    await pool.query(
      'INSERT INTO user_banks (user_id, bank_name, account_number, account_name) VALUES (?, ?, ?, ?)',
      [userId, nameBank, accountNumber, cleanOwner]
    );

    return sendResponse(res, true, 'Thêm ngân hàng thành công');
  } catch (err) { next(err); }
};

export const getBanking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      'SELECT bank_name as bankName, account_number as accountNumber, account_name as ownerName FROM user_banks WHERE user_id = ? AND status = "active" LIMIT 1',
      [userId]
    );

    if (rows.length === 0) {
      return sendResponse(res, false, 'Chưa có thông tin ngân hàng', null, 200);
    }

    return sendResponse(res, true, 'Thành công', rows[0]);
  } catch (err) { next(err); }
};

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
      return sendResponse(res, false, 'Vui lòng nhập đầy đủ thông tin');
    }
    if (newPassword.length < 6) {
      return sendResponse(res, false, 'Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return sendResponse(res, false, 'Người dùng không tồn tại');
    const user = users[0];

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return sendResponse(res, false, 'Mật khẩu cũ không chính xác');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hash, userId]);

    return sendResponse(res, true, 'Đổi mật khẩu thành công');
  } catch (err) { next(err); }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, email, phone } = req.body;
    const userId = req.user.id;

    // 1. Validate Phone (if provided)
    if (phone) {
      const phoneRegex = /^\d{10,11}$/;
      if (!phoneRegex.test(phone)) {
        return sendResponse(res, false, 'Số điện thoại không hợp lệ');
      }
    }

    // 2. Validate Full Name (if provided and currently empty)
    const [users] = await pool.query('SELECT name_real FROM users WHERE id = ?', [userId]);
    const currentName = users[0]?.name_real;

    if (fullName && !currentName) {
      if (fullName.length < 2) {
          return sendResponse(res, false, 'Họ và tên quá ngắn');
      }
    }

    let updateQuery = 'UPDATE users SET email = ?';
    let params = [email || ''];

    if (phone) {
      updateQuery += ', phone = ?';
      params.push(phone);
    }

    if (!currentName && fullName) {
      updateQuery += ', name_real = ?';
      params.push(fullName);
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(userId);

    await pool.query(updateQuery, params);

    return sendResponse(res, true, 'Cập nhật thành công' + (!currentName && fullName ? '' : ' (Lưu ý: Họ tên không thể thay đổi sau khi đã đặt)'));
  } catch (err) { next(err); }
};

export const changePasswordV2 = async (req, res, next) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    if (!newPassword || newPassword !== confirmPassword) {
      return sendResponse(res, false, 'Mật khẩu xác nhận không khớp');
    }

    // Use bcrypt — MD5 is deprecated for password storage
    const hash = await bcrypt.hash(newPassword, 10);

    await pool.query('UPDATE users SET password_v2 = ? WHERE id = ?', [hash, userId]);

    return sendResponse(res, true, 'Cập nhật mật khẩu thanh toán thành công');
  } catch (err) { next(err); }
};

export const changePasswordDirect = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user.id;

    if (!newPassword || newPassword.length < 6) {
      return sendResponse(res, false, 'Mật khẩu phải có ít nhất 6 ký tự');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hash, userId]);

    return sendResponse(res, true, 'Thay đổi mật khẩu thành công');
  } catch (err) { next(err); }
};

export const getBetHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { room_id, time, status } = req.query;

    let conditions = ['b.user_id = ?'];
    let params = [userId];

    if (room_id && room_id !== 'all') {
      // Handle both numerical ID and string game_id
      if (isNaN(room_id)) {
        conditions.push('UPPER(r.game_id) = ?');
        params.push(room_id.toUpperCase());
      } else {
        conditions.push('b.room_id = ?');
        params.push(room_id);
      }
    }

    if (time) {
      const now = new Date();
      let startTime, endTime;
      switch (time) {
        case 'today': startTime = new Date(now).setHours(0, 0, 0, 0); break;
        case 'yesterday':
          const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
          startTime = new Date(yesterday).setHours(0, 0, 0, 0);
          endTime = new Date(yesterday).setHours(23, 59, 59, 999); break;
        case 'thisWeek':
          const currentDay = now.getDay();
          const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
          startTime = new Date(now.setDate(diff)).setHours(0, 0, 0, 0); break;
        case 'thisMonth': startTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime(); break;
      }
      if (startTime) { conditions.push('b.time >= ?'); params.push(startTime); }
      if (endTime) { conditions.push('b.time <= ?'); params.push(endTime); }
    }

    if (status && status !== 'all') {
      if (status === 'won') conditions.push('b.status = 1');
      else if (status === 'lost') conditions.push('b.status = 2');
      else if (status === 'pending') conditions.push('b.status = 0');
    }

    const [rows] = await pool.query(
      `SELECT b.*, r.name as room_name, s.period 
       FROM bets b 
       JOIN game_rooms r ON b.room_id = r.id 
       JOIN game_sessions s ON b.session_id = s.id
       WHERE ${conditions.join(' AND ')} ORDER BY b.time DESC LIMIT 100`,
      params
    );

    const [summaryRows] = await pool.query(
      `SELECT SUM(b.amount) as totalBet, SUM(b.win_amount) as totalWin 
       FROM bets b 
       LEFT JOIN game_rooms r ON b.room_id = r.id 
       WHERE ${conditions.join(' AND ')}`,
      params
    );

    return sendResponse(res, true, 'Thành công', {
      list: rows.map(item => ({
        id: item.id,
        game_id: item.room_id,
        game_name: item.room_name,
        bet_value: item.bet_value,
        created_at: item.time,
        amount: item.amount,
        win_amount: item.win_amount,
        status: item.status,
        period: item.period
      })),
      summary: {
        totalBet: parseFloat(summaryRows[0].totalBet || 0),
        totalWin: parseFloat(summaryRows[0].totalWin || 0)
      }
    });
  } catch (err) { next(err); }
};
