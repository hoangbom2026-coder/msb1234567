import pool from '../config/database.js';
import { sendResponse } from '../utils/helpers.js';
import { sendTelegramAdmin } from '../utils/telegram.js';

/**
 * Thống kê tổng quan cho Dashboard
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;
    const agentId = req.user.agent_id;

    let userFilter = '';
    let rechargeFilter = '';
    let withdrawFilter = '';
    let betFilter = '';
    let params = [];

    // Phân quyền dữ liệu
    if (role === 'agent') {
      userFilter = ' WHERE agent_id = ?';
      rechargeFilter = ' AND phone IN (SELECT phone FROM users WHERE agent_id = ?)';
      withdrawFilter = ' AND phone IN (SELECT phone FROM users WHERE agent_id = ?)';
      betFilter = ' WHERE user_id IN (SELECT id FROM users WHERE agent_id = ?)';
      params = [userId];
    } else if (role === 'cskh' && agentId) {
      userFilter = ' WHERE agent_id = ?';
      rechargeFilter = ' AND phone IN (SELECT phone FROM users WHERE agent_id = ?)';
      withdrawFilter = ' AND phone IN (SELECT phone FROM users WHERE agent_id = ?)';
      betFilter = ' WHERE user_id IN (SELECT id FROM users WHERE agent_id = ?)';
      params = [agentId];
    }

    const [[{ total_users }]] = await pool.query(`SELECT COUNT(*) as total_users FROM users${userFilter}`, params);
    const [[{ total_recharge }]] = await pool.query(`SELECT SUM(money) as total_recharge FROM recharge WHERE status = 1${rechargeFilter}`, params);
    const [[{ total_withdraw }]] = await pool.query(`SELECT SUM(money) as total_withdraw FROM withdraw WHERE status = 1${withdrawFilter}`, params);
    const [[{ pending_withdraw }]] = await pool.query(`SELECT COUNT(*) as pending_withdraw FROM withdraw WHERE status = 0${withdrawFilter}`, params);

    // Get unread chats
    let chatFilter = '';
    if (role === 'agent') {
      chatFilter = ' AND user_id IN (SELECT id FROM users WHERE agent_id = ?)';
    } else if (role === 'cskh' && agentId) {
      chatFilter = ' AND user_id IN (SELECT id FROM users WHERE agent_id = ?)';
    }
    const [[{ unread_chats }]] = await pool.query(`SELECT COUNT(*) as unread_chats FROM chat_conversations WHERE has_unread_user_messages = 1${chatFilter}`, role === 'admin' ? [] : params);

    // Get online users (users active in last 5 minutes)
    const fiveMinutesAgo = Date.now() - 300000;
    const [[{ online_users }]] = await pool.query(`SELECT COUNT(*) as online_users FROM users WHERE status = 1 AND created_at >= ?${userFilter ? ' AND agent_id = ?' : ''}`, userFilter ? [fiveMinutesAgo, ...params] : [fiveMinutesAgo]);

    // Get new users today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const [[{ new_users_today }]] = await pool.query(
        `SELECT COUNT(*) as new_users_today FROM users WHERE created_at >= ?${userFilter ? ' AND agent_id = ?' : ''}`, 
        userFilter ? [startOfToday.getTime(), params[0]] : [startOfToday.getTime()]
    );

    // Trends (15 ngày gần nhất)
    const [rechargeTrend] = await pool.query(
      `SELECT DATE(FROM_UNIXTIME(time/1000)) as date, SUM(money) as amount 
       FROM recharge WHERE status = 1${rechargeFilter} 
       GROUP BY DATE(FROM_UNIXTIME(time/1000)) 
       ORDER BY date DESC LIMIT 15`, params
    );

    const [withdrawTrend] = await pool.query(
      `SELECT DATE(FROM_UNIXTIME(time/1000)) as date, SUM(money) as amount 
       FROM withdraw WHERE status = 1${withdrawFilter} 
       GROUP BY DATE(FROM_UNIXTIME(time/1000)) 
       ORDER BY date DESC LIMIT 15`, params
    );

    // Payout calculation
    let payoutValue = 0;
    if (userFilter) {
      // For Agents/CSKH: Sum win_amount from bets of their users
      const [[{ total_payout }]] = await pool.query(`SELECT SUM(win_amount) as total_payout FROM bets WHERE status = 1${betFilter.replace(' WHERE', ' AND')}`, params);
      payoutValue = total_payout || 0;
    } else {
      // For Admin: Sum total_payout from all finished sessions
      const [[{ total_payout }]] = await pool.query('SELECT SUM(total_payout) as total_payout FROM game_sessions WHERE status = 2');
      payoutValue = total_payout || 0;
    }

    const [[{ total_bet }]] = await pool.query(`SELECT SUM(amount) as total_bet FROM bets WHERE status IN (1, 2)${betFilter.replace(' WHERE', ' AND')}`, params);

    // Recent 5 users
    const [recentUsers] = await pool.query(`SELECT phone, created_at, level FROM users${userFilter} ORDER BY id DESC LIMIT 5`, params);

    // Recent 5 transactions
    const [recentTx] = await pool.query(`
        (SELECT 'recharge' as type, phone, money, time as tx_time, status FROM recharge WHERE status = 0${rechargeFilter} LIMIT 3)
        UNION ALL
        (SELECT 'withdraw' as type, phone, money, time as tx_time, status FROM withdraw WHERE status = 0${withdrawFilter} LIMIT 3)
        ORDER BY tx_time DESC LIMIT 5
    `, [...params, ...params]);

    const [[{ live_bet_total }]] = await pool.query(`SELECT SUM(amount) as live_bet_total FROM bets WHERE status = 0${betFilter.replace(' WHERE', ' AND')}`, params);

    return sendResponse(res, true, 'Lấy thống kê thành công', {
      total_users: total_users || 0,
      total_recharge: total_recharge || 0,
      total_withdraw: total_withdraw || 0,
      pending_withdraw: pending_withdraw || 0,
      new_users_today: new_users_today || 0,
      unread_chats: unread_chats || 0,
      online_users: online_users || 0,
      profit: (total_recharge || 0) - (total_withdraw || 0),
      gaming_profit: (total_bet || 0) - (payoutValue || 0),
      total_bet: total_bet || 0,
      total_payout: payoutValue || 0,
      live_bet_total: live_bet_total || 0,
      trends: {
        recharge: rechargeTrend || [],
        withdraw: withdrawTrend || []
      },
      recent: {
        users: recentUsers || [],
        transactions: recentTx.map(tx => ({ ...tx, created_at: tx.tx_time }))
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Top Players by Bet Volume (Last 24h)
 */
export const getTopPlayers = async (req, res, next) => {
  try {
    const [top] = await pool.query(`
            SELECT u.phone, u.name_real, SUM(b.amount) as total_bet, SUM(b.win_amount) as total_win
            FROM bets b
            JOIN users u ON b.user_id = u.id
            WHERE b.time >= ?
            GROUP BY u.id
            ORDER BY total_bet DESC
            LIMIT 5
        `, [Date.now() - 86400000]);

    return sendResponse(res, true, 'Thành công', top || []);
  } catch (err) {
    next(err);
  }
};

export const getOpenSessions = async (req, res, next) => {
  try {
    const [sessions] = await pool.query(
      `SELECT s.*, r.name as room_name, r.type as room_type, r.game_id
       FROM game_sessions s 
       JOIN game_rooms r ON s.room_id = r.id
       WHERE s.status = 0 
       ORDER BY s.end_time ASC`
    );

    if (sessions.length > 0) {
      const sessionIds = sessions.map(s => s.id);
      const [allBets] = await pool.query(
        'SELECT session_id, bet_value, SUM(amount) as total_amount, COUNT(*) as count FROM bets WHERE session_id IN (?) GROUP BY session_id, bet_value',
        [sessionIds]
      );

      for (let session of sessions) {
        const sessionBets = allBets.filter(b => b.session_id === session.id);
        let total_money = 0;
        let analysis = {
          big_small: { big: 0, small: 0 },
          odd_even: { odd: 0, even: 0 },
          details: sessionBets
        };

        sessionBets.forEach(b => {
          const amt = parseFloat(b.total_amount);
          total_money += amt;
          const val = b.bet_value.toLowerCase();

          // Big/Small aggregation
          if (val === 'big' || val === 'b' || val === 'tài' || val.endsWith('-b') || val.endsWith('-big')) {
            analysis.big_small.big += amt;
          } else if (val === 'small' || val === 's' || val === 'xỉu' || val.endsWith('-s') || val.endsWith('-small')) {
            analysis.big_small.small += amt;
          }

          // Odd/Even aggregation
          if (val === 'odd' || val === 'l' || val === 'lẻ' || val.endsWith('-l') || val.endsWith('-odd')) {
            analysis.odd_even.odd += amt;
          } else if (val === 'even' || val === 'c' || val === 'chẵn' || val.endsWith('-c') || val.endsWith('-even')) {
            analysis.odd_even.even += amt;
          }
        });

        session.bet_stats = sessionBets;
        session.total_bet_money = total_money;
        session.analysis = analysis;

        // Logic gợi ý: Nên chốt kết quả vào cửa có ít tiền đặt nhất để nhà cái có lợi
        if (total_money > 0) {
           const isBigLess = analysis.big_small.big < analysis.big_small.small;
           const isOddLess = analysis.odd_even.odd < analysis.odd_even.even;
           session.suggestion = `${isBigLess ? 'Tài' : 'Xỉu'} + ${isOddLess ? 'Lẻ' : 'Chẵn'}`;
        } else {
           session.suggestion = 'Ngẫu nhiên';
        }

      }
    }

    return sendResponse(res, true, 'Thành công', sessions);
  } catch (err) { next(err); }
};

export const getGameHistory = async (req, res, next) => {
  try {
    const { game_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.*, r.name as game_name, r.game_id 
      FROM game_sessions s
      JOIN game_rooms r ON s.room_id = r.id
      WHERE s.status = 2
    `;
    let params = [];

    if (game_id) {
      query += ' AND (r.game_id = ? OR r.id = ?)';
      params.push(game_id, game_id);
    }

    query += ' ORDER BY s.end_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);
    return sendResponse(res, true, 'Thành công', rows);
  } catch (err) { next(err); }
};

export const getUsers = async (req, res, next) => {
  try {
    const { phone, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const today = new Date().toISOString().split('T')[0];

    let query = `
      SELECT 
        u.id, u.phone, u.name_real, u.money, u.level, u.status, u.role, u.code, u.invite, u.created_at, u.agent_id,
        IFNULL(ds.total_bet, 0) as today_bet,
        (IFNULL(ds.total_win, 0) - IFNULL(ds.total_bet, 0)) as today_profit,
        IFNULL(rec.total, 0) as total_recharge,
        IFNULL(wit.total, 0) as total_withdraw,
        ub.bank_name, ub.account_number, ub.account_name
      FROM users u
      LEFT JOIN daily_stats ds ON u.id = ds.user_id AND ds.stat_date = ?
      LEFT JOIN (SELECT phone, SUM(money) as total FROM recharge WHERE status = 1 GROUP BY phone) rec ON u.phone = rec.phone
      LEFT JOIN (SELECT phone, SUM(money) as total FROM withdraw WHERE status = 1 GROUP BY phone) wit ON u.phone = wit.phone
      LEFT JOIN user_banks ub ON u.id = ub.user_id AND ub.status = 'active'
    `;
    let params = [today];
    let where = [];

    if (phone) {
      where.push('u.phone LIKE ?');
      params.push(`%${phone}%`);
    }

    // Role-based filtering
    if (req.user.role === 'agent') {
      where.push('u.agent_id = ?');
      params.push(req.user.id);
    } else if (req.user.role === 'cskh' && req.user.agent_id) {
      where.push('u.agent_id = ?');
      params.push(req.user.agent_id);
    }

    if (where.length > 0) {
      query += ' WHERE ' + where.join(' AND ');
    }

    query += ' ORDER BY u.id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM users u';
    if (where.length > 0) {
      countQuery += ' WHERE ' + where.join(' AND ');
    }
    const [[{ total }]] = await pool.query(countQuery, params.slice(0, -2));

    return sendResponse(res, true, 'Thành công', { rows, total });
  } catch (err) { next(err); }
};

/**
 * Quản lý Mã mời và Hệ thống Đại lý
 */
export const getReferralStats = async (req, res, next) => {
  try {
    const { phone, code, limit = 20, offset = 0 } = req.query;
    let query = `
      SELECT 
        u.id, u.phone, u.name_real, u.code, u.invite as invited_by_code,
        (SELECT COUNT(*) FROM users WHERE invite = u.code) as referral_count,
        (SELECT SUM(money) FROM recharge WHERE status = 1 AND phone IN (SELECT phone FROM users WHERE invite = u.code)) as total_ref_recharge
      FROM users u
    `;
    let params = [];
    let where = [];

    if (req.user.role === 'agent') {
      where.push('u.code = ? OR u.invite = ?');
      params.push(req.user.code, req.user.code);
    }

    if (where.length > 0) {
      query += ' WHERE ' + where.join(' AND ');
    }

    query += ' ORDER BY referral_count DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);
    
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM users' + (where.length > 0 ? ' WHERE ' + where.join(' AND ') : ''), params.slice(0, -2));

    return sendResponse(res, true, 'Lấy danh sách thành công', { rows, total });
  } catch (err) { next(err); }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { userId, status } = req.body;
    const [userCheck] = await pool.query('SELECT phone FROM users WHERE id = ?', [userId]);
    if (userCheck.length === 0) return sendResponse(res, false, 'Người dùng không tồn tại');

    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);

    // Log action
    await logAdminAction(req.user.id, status == 0 ? 'BLOCK_USER' : 'UNBLOCK_USER', `User: ${userCheck[0].phone}`, { status }, req.ip);

    // Real-time notification if blocked
    if (status == 0) {
      try {
        const { getIO } = await import('../config/socket.js');
        getIO().to(`user_${userId}`).emit('reAuth', { message: 'Tài khoản của bạn đã bị khóa bởi quản trị viên.' });
        getIO().to(`user_${userId}`).emit('forceLogout', { reason: 'Account locked' });
      } catch (ioErr) {
        console.error('Socket notification failed:', ioErr.message);
      }
    }

    return sendResponse(res, true, status == 0 ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
  } catch (err) { next(err); }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id, isCreate, isDelete, userId, ...fields } = req.body;
    const targetId = id || userId;
    
    // Map role to level
    if (fields.role) {
      const roleLevelMap = { user: 1, cskh: 2, agent: 3, admin: 4 };
      fields.level = roleLevelMap[fields.role] || 1;
    }

    // Security check: Only Admin can create/edit other Admins or Agents
    const requesterLevel = req.user.level;
    if (requesterLevel < 4) {
        if (fields.level && fields.level >= 3) {
            return sendResponse(res, false, 'Bạn không có quyền gán vai trò này.');
        }
    }
    
    if (isDelete && targetId) {
       if (requesterLevel < 4) return sendResponse(res, false, 'Bạn không có quyền thực hiện hành động này.');
       
       const [u] = await pool.query('SELECT phone FROM users WHERE id = ?', [targetId]);
       if (u.length === 0) return sendResponse(res, false, 'Người dùng không tồn tại');
       
       await pool.query('DELETE FROM users WHERE id = ?', [targetId]);
       await logAdminAction(req.user.id, 'DELETE_USER', `User: ${u[0].phone}`, { userId: targetId }, req.ip);
       
       return sendResponse(res, true, 'Xóa tài khoản thành công');
    }

    if (isCreate) {
        if (!fields.phone || !fields.password) return sendResponse(res, false, 'Thiếu thông tin bắt buộc');
        const [exist] = await pool.query('SELECT phone FROM users WHERE phone = ?', [fields.phone]);
        if (exist.length > 0) return sendResponse(res, false, 'Số điện thoại đã tồn tại');
        
        const bcrypt = await import('bcrypt');
        const salt = await bcrypt.default.genSalt(10);
        const hash = await bcrypt.default.hash(fields.password, salt);
        
        const role = fields.role || 'user';
        const level = fields.level || 1;
        const status = fields.status !== undefined ? fields.status : 1;
        const code = fields.invite_code || '';
        const ip = req.ip || '127.0.0.1';
        const time = Date.now();
        const parentId = fields.agent_id || fields.parent_id || 0;
        
        await pool.query(
            'INSERT INTO users (phone, password, role, level, status, code, agent_id, ip, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [fields.phone, hash, role, level, status, code, parentId, ip, time]
        );
        return sendResponse(res, true, 'Tạo tài khoản thành công');
    }
    
    if (!targetId) return sendResponse(res, false, 'Thiếu ID người dùng');

    // 1. Check if user exists
    const [userRows] = await pool.query('SELECT phone FROM users WHERE id = ?', [targetId]);
    if (userRows.length === 0) return sendResponse(res, false, 'Người dùng không tồn tại');

    // 2. Build dynamic update query
    const allowedFields = ['phone', 'name_real', 'name_user', 'money', 'level', 'status', 'role', 'invite', 'code', 'agent_id'];
    let updatePairs = [];
    let params = [];

    // Also support saving invite_code to code column for agent/cskh code
    if (fields.invite_code !== undefined) {
        fields.code = fields.invite_code;
    }

    for (const [key, value] of Object.entries(fields)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updatePairs.push(`${key} = ?`);
        params.push(value);
      } else if (key === 'password' && value) {
        const bcrypt = await import('bcrypt');
        const salt = await bcrypt.default.genSalt(10);
        const hash = await bcrypt.default.hash(value, salt);
        updatePairs.push(`password = ?`);
        params.push(hash);
      } else if (key === 'password_withdraw' && value) {
        const bcrypt = await import('bcrypt');
        const salt = await bcrypt.default.genSalt(10);
        const hash = await bcrypt.default.hash(value, salt);
        updatePairs.push(`password_v2 = ?`);
        params.push(hash);
      }
    }

    if (updatePairs.length === 0) {
      return sendResponse(res, false, 'Không có thông tin hợp lệ để cập nhật');
    }

    params.push(targetId);
    const query = `UPDATE users SET ${updatePairs.join(', ')} WHERE id = ?`;

    await pool.query(query, params);

    // 2.5 Update Bank info if provided
    if (fields.bank_name || fields.account_number || fields.account_name) {
        const [existingBank] = await pool.query('SELECT id FROM user_banks WHERE user_id = ?', [targetId]);
        if (existingBank.length > 0) {
            let bankPairs = [];
            let bankParams = [];
            if (fields.bank_name) { bankPairs.push('bank_name = ?'); bankParams.push(fields.bank_name); }
            if (fields.account_number) { bankPairs.push('account_number = ?'); bankParams.push(fields.account_number); }
            if (fields.account_name) { bankPairs.push('account_name = ?'); bankParams.push(fields.account_name.toUpperCase()); }
            
            if (bankPairs.length > 0) {
                bankParams.push(targetId);
                await pool.query(`UPDATE user_banks SET ${bankPairs.join(', ')} WHERE user_id = ? AND status = 'active'`, bankParams);
            }
        } else {
            await pool.query(
                'INSERT INTO user_banks (user_id, bank_name, account_number, account_name, status) VALUES (?, ?, ?, ?, "active")',
                [targetId, fields.bank_name || '', fields.account_number || '', (fields.account_name || '').toUpperCase()]
            );
        }
    }

    // 3. Log action
    await logAdminAction(req.user.id, 'UPDATE_USER_FULL', `User: ${userRows[0].phone}`, fields, req.ip);

    // 4. Real-time notification if needed (e.g., balance or level change)
    try {
      const { getIO } = await import('../config/socket.js');
      if (fields.role || fields.status === 0) {
          getIO().to(`user_${targetId}`).emit('reAuth', { message: 'Tài khoản của bạn đã được cập nhật bởi quản trị viên.' });
      }
      if (fields.money !== undefined) {
          getIO().to(`user_${targetId}`).emit('balanceUpdate', { money: fields.money });
      }
    } catch (ignore) {}

    return sendResponse(res, true, 'Cập nhật thông tin người dùng thành công');
  } catch (err) { next(err); }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const [userCheck] = await pool.query('SELECT phone FROM users WHERE id = ?', [userId]);
    if (userCheck.length === 0) return sendResponse(res, false, 'Người dùng không tồn tại');

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);

    // Log action
    await logAdminAction(req.user.id, 'CHANGE_ROLE', `User: ${userCheck[0].phone}`, { role }, req.ip);

    // Real-time notification
    try {
      const { getIO } = await import('../config/socket.js');
      getIO().to(`user_${userId}`).emit('notification', { 
        title: 'Cập nhật tài khoản', 
        content: `Cấp bậc tài khoản của bạn đã được thay đổi thành: ${role}` 
      });
    } catch (ignore) {}

    return sendResponse(res, true, `Đã cập nhật quyền thành: ${role}`);
  } catch (err) { next(err); }
};

export const adjustBalance = async (req, res, next) => {
  try {
    const { userId, amount, type } = req.body;
    const val = Math.abs(parseFloat(amount)) * (type === 'sub' ? -1 : 1);

    const [[user]] = await pool.query('SELECT phone FROM users WHERE id = ?', [userId]);
    if (!user) return sendResponse(res, false, 'Người dùng không tồn tại');

    const [result] = await pool.query('UPDATE users SET money = money + ? WHERE id = ?', [val, userId]);
    if (result.affectedRows === 0) return sendResponse(res, false, 'Không thể cập nhật số dư');

    // Get final balance after update
    const [[updatedUser]] = await pool.query('SELECT money FROM users WHERE id = ?', [userId]);

    // Log action
    await logAdminAction(req.user.id, 'ADJUST_BALANCE', `User: ${user.phone}`, { amount, type, val, newBalance: updatedUser.money }, req.ip);

    // Record transaction for profit calculation
    const timeNow = new Date().getTime();
    const todayStr = new Date().toISOString().split('T')[0];
    const orderId = 'ADJ' + timeNow + Math.floor(Math.random() * 1000);
    
    if (type === 'add') {
      await pool.query(
        'INSERT INTO recharge (id_order, phone, user_id, money, type, status, today, time, proof_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [orderId, user.phone, userId, Math.abs(parseFloat(amount)), 'admin_add', 1, todayStr, timeNow, '']
      );
    } else {
      await pool.query(
        'INSERT INTO withdraw (id_order, phone, user_id, money, gross_amount, fee, receive_amount, type, status, today, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [orderId, user.phone, userId, Math.abs(parseFloat(amount)), Math.abs(parseFloat(amount)), 0, Math.abs(parseFloat(amount)), 'admin_sub', 1, todayStr, timeNow]
      );
    }

    // Thông báo realtime
    const { getIO } = await import('../config/socket.js');
    getIO().to(`user_${userId}`).emit('balanceUpdate', { money: updatedUser.money });

    return sendResponse(res, true, 'Điều chỉnh số dư thành công');
  } catch (err) { next(err); }
};

export const getTransactions = async (req, res, next) => {
  try {
    const role = req.user.role;
    const agentId = req.user.agent_id;
    let whereClause = '';
    let params = [];

    // Apply role-based filtering
    if (role === 'agent') {
      whereClause = ' WHERE u.agent_id = ?';
      params.push(req.user.id);
    } else if (role === 'cskh' && agentId) {
      whereClause = ' WHERE u.agent_id = ?';
      params.push(agentId);
    }

    const query = `
      SELECT w.*, u.name_real, u.name_user, b.bank_name, b.account_number, b.account_name 
      FROM withdraw w
      LEFT JOIN users u ON w.phone = u.phone
      LEFT JOIN user_banks b ON u.id = b.user_id AND b.status = 'active'
      ${whereClause}
      ORDER BY w.id DESC LIMIT 100
    `;
    const [rows] = await pool.query(query, params);
    return sendResponse(res, true, 'Thành công', rows);
  } catch (err) { next(err); }
};

export const approveTransaction = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { id_order, status } = req.body;
    // Force type to withdraw, remove support for recharge approval
    const type = 'withdraw'; 

    await connection.beginTransaction();
    const table = 'withdraw';
    const [orders] = await connection.query(`SELECT * FROM ${table} WHERE id_order = ? FOR UPDATE`, [id_order]);

    if (orders.length === 0 || orders[0].status !== 0) {
      throw new Error('Đơn không tồn tại hoặc đã được xử lý');
    }

    if (type === 'recharge' && (status === 1 || status == 1)) {
      const userParam = orders[0].user_id || 0;
      const phoneParam = orders[0].phone || '';
      
      if (userParam > 0) {
          await connection.query('UPDATE users SET money = money + ? WHERE id = ?', [orders[0].money, userParam]);
      } else {
          await connection.query('UPDATE users SET money = money + ? WHERE phone = ?', [orders[0].money, phoneParam]);
      }
    }

    // Nếu rút tiền bị từ chối (status = 2), hoàn tiền lại cho user
    if (type === 'withdraw' && (status === 2 || status == 2)) {
      const userParam = orders[0].user_id || 0;
      const phoneParam = orders[0].phone || '';

      if (userParam > 0) {
          await connection.query('UPDATE users SET money = money + ? WHERE id = ?', [orders[0].money, userParam]);
      } else {
          await connection.query('UPDATE users SET money = money + ? WHERE phone = ?', [orders[0].money, phoneParam]);
      }
    }

    await connection.query(`UPDATE ${table} SET status = ? WHERE id_order = ?`, [status, id_order]);

    await connection.commit();

    // Log action
    await logAdminAction(req.user?.id, `${status == 1 ? 'APPROVE' : 'REJECT'}_${type.toUpperCase()}`, `Order: ${id_order}`, { status, phone: orders[0].phone, money: orders[0].money }, req.ip);

    // Thông báo cho user qua socket nếu đang online
    const userParam = orders[0].user_id || 0;
    const phoneParam = orders[0].phone || '';
    
    let targetUser = null;
    if (userParam > 0) {
        const [u] = await pool.query('SELECT id, money FROM users WHERE id = ?', [userParam]);
        if (u.length > 0) targetUser = u[0];
    } else {
        const [u] = await pool.query('SELECT id, money FROM users WHERE phone = ?', [phoneParam]);
        if (u.length > 0) targetUser = u[0];
    }

    if (targetUser) {
      const { getIO } = await import('../config/socket.js');
      getIO().to(`user_${targetUser.id}`).emit('balanceUpdate', { money: parseFloat(targetUser.money) });
      getIO().to(`user_${targetUser.id}`).emit('transactionUpdate', { type, id_order, status });
    }

    return sendResponse(res, true, 'Thành công');
  } catch (err) {
    await connection.rollback();
    return sendResponse(res, false, err.message);
  } finally {
    connection.release();
  }
};

export const getGames = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM game_rooms ORDER BY id ASC');
    return sendResponse(res, true, 'Thành công', rows);
  } catch (err) { next(err); }
};

export const updateGame = async (req, res, next) => {
  try {
    const { game_id } = req.params;
    const body = req.body;
    
    let updatePairs = [];
    let params = [];

    const directFields = {
      name: 'name',
      status: 'status',
      cycle_time: 'cycle_seconds',
      cycle_seconds: 'cycle_seconds',
      bet_close_seconds: 'bet_close_seconds',
      sort_order: 'sort_order'
    };

    let configUpdates = {};

    for (const [key, value] of Object.entries(body)) {
      if (directFields[key]) {
        updatePairs.push(`${directFields[key]} = ?`);
        params.push(value);
      } else if (key === 'odds') {
        let oddsValue = value;
        if (typeof value !== 'object') {
            const val = parseFloat(value);
            oddsValue = { ho: val, rong: val, common: val, special: val };
        }
        updatePairs.push('odds = ?');
        params.push(JSON.stringify(oddsValue));
      } else if (key === 'min_bet' || key === 'max_bet' || key === 'round_duration') {
        configUpdates[key] = parseFloat(value);
      }
    }

    if (Object.keys(configUpdates).length > 0) {
        const [[existing]] = await pool.query('SELECT config FROM game_rooms WHERE game_id = ?', [game_id]);
        let currentConfig = existing?.config || {};
        if (typeof currentConfig === 'string') {
            try { currentConfig = JSON.parse(currentConfig); } catch (e) { currentConfig = {}; }
        }
        
        const newConfig = { ...(currentConfig || {}), ...configUpdates };
        updatePairs.push(`config = ?`);
        params.push(JSON.stringify(newConfig));
    }

    if (updatePairs.length === 0) {
      return sendResponse(res, false, 'Không có dữ liệu cập nhật');
    }

    const query = `UPDATE game_rooms SET ${updatePairs.join(', ')} WHERE game_id = ?`;
    params.push(game_id);

    const [result] = await pool.query(query, params);
    
    if (result.affectedRows === 0) {
        return sendResponse(res, false, 'Không tìm thấy trò chơi để cập nhật');
    }

    await logAdminAction(req.user?.id, 'UPDATE_GAME', `Game: ${game_id}`, body, req.ip);

    return sendResponse(res, true, 'Cập nhật thông số trò chơi thành công');
  } catch (err) { 
    console.error('[ERROR] updateGame:', err);
    next(err); 
  }
};
export const adjustGameResult = async (req, res, next) => {
  try {
    const { sessionId, result } = req.body;
    console.log(`[ADMIN ACTION] Adjusting Result for Session ${sessionId} to:`, result);

    const [updateResult] = await pool.query('UPDATE game_sessions SET result = ? WHERE id = ? AND status = 0', [JSON.stringify(result), sessionId]);
    
    if (updateResult.affectedRows === 0) {
      return sendResponse(res, false, 'Không thể chỉnh kết quả. Phiên có thể đã đóng hoặc không tồn tại.');
    }

    // Broadcast update to room so frontend knows result is locked (if needed) or just to sync
    const [session] = await pool.query(
      'SELECT s.*, r.game_id FROM game_sessions s JOIN game_rooms r ON s.room_id = r.id WHERE s.id = ?',
      [sessionId]
    );
    if (session.length > 0) {
      const { getIO } = await import('../config/socket.js');
      getIO().to(`room_${session[0].game_id}`).emit('sessionUpdate', {
        period: session[0].period,
        endTime: session[0].end_time,
        adjusted: true
      });
    }

    // Log action
    await logAdminAction(req.user.id, 'ADJUST_GAME_RESULT', `Session: ${sessionId}`, { result }, req.ip);

    return sendResponse(res, true, 'Đã chốt kết quả kỳ quay. Kết quả này sẽ được áp dụng khi hết thời gian.');
  } catch (err) { next(err); }
};

/**
 * Hệ thống Logs và Cấu hình
 */
export const getSystemConfig = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM system_config');
    const config = rows.reduce((acc, cur) => {
      acc[cur.config_key] = cur.config_value;
      return acc;
    }, {});
    return sendResponse(res, true, 'Thành công', config);
  } catch (err) { next(err); }
};

export const updateSystemConfig = async (req, res, next) => {
  try {
    const configs = req.body; // { site_name: '...', telegram_support: '...' }
    for (const [key, value] of Object.entries(configs)) {
      await pool.query(
        'INSERT INTO system_config (config_key, config_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_value = ?',
        [key, value, value]
      );
    }
    // Log action
    await logAdminAction(req.user.id, 'UPDATE_SYSTEM_CONFIG', 'system_config', configs, req.ip);

    return sendResponse(res, true, 'Đã cập nhật cấu hình');
  } catch (err) { next(err); }
};

export const getBets = async (req, res, next) => {
  try {
    const { phone, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const role = req.user.role;
    const agentId = req.user.agent_id;

    let query = `
      SELECT b.*, u.phone, r.name as room_name, r.game_id
      FROM bets b
      JOIN users u ON b.user_id = u.id
      JOIN game_rooms r ON b.room_id = r.id
    `;
    let params = [];
    let where = [];

    if (phone) {
      where.push('u.phone LIKE ?');
      params.push(`%${phone}%`);
    }

    // Role-based filtering
    if (role === 'agent') {
      where.push('u.agent_id = ?');
      params.push(req.user.id);
    } else if (role === 'cskh' && agentId) {
      where.push('u.agent_id = ?');
      params.push(agentId);
    }

    if (where.length > 0) {
      query += ' WHERE ' + where.join(' AND ');
    }
    
    query += ' ORDER BY b.id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);
    
    let countQuery = 'SELECT COUNT(*) as total FROM bets b JOIN users u ON b.user_id = u.id';
    let countParams = [];
    if (where.length > 0) {
      countQuery += ' WHERE ' + where.join(' AND ');
      countParams = params.slice(0, -2);
    }
    const [[{ total }]] = await pool.query(countQuery, countParams);

    return sendResponse(res, true, 'Thành công', { rows, total });
  } catch (err) { next(err); }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.*, u.phone as admin_phone 
       FROM audit_logs l 
       LEFT JOIN users u ON l.admin_id = u.id 
       ORDER BY l.created_at DESC LIMIT 200`
    );
    return sendResponse(res, true, 'Thành công', rows);
  } catch (err) { next(err); }
};

/**
 * Quản lý Ngân hàng Hệ thống
 */
export const getSystemBanks = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM system_banks ORDER BY id DESC');
    return sendResponse(res, true, 'Thành công', rows);
  } catch (err) { next(err); }
};

export const updateSystemBank = async (req, res, next) => {
  try {
    const { id, bank_name, account_number, account_name, status } = req.body;
    if (id) {
      await pool.query(
        'UPDATE system_banks SET bank_name = ?, account_number = ?, account_name = ?, status = ? WHERE id = ?',
        [bank_name, account_number, account_name, status, id]
      );
    } else {
      await pool.query(
        'INSERT INTO system_banks (bank_name, account_number, account_name, status) VALUES (?, ?, ?, ?)',
        [bank_name, account_number, account_name, status]
      );
    }

    // Standard Log
    await logAdminAction(req.user?.id, id ? 'UPDATE_BANK' : 'CREATE_BANK', `Bank: ${bank_name}`, req.body, req.ip);

    return sendResponse(res, true, 'Thành công');
  } catch (err) { next(err); }
};

export const deleteSystemBank = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM system_banks WHERE id = ?', [id]);
    return sendResponse(res, true, 'Đã xóa');
  } catch (err) { next(err); }
};

/**
 * Quản lý Banners
 */
export const getBanners = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM banners ORDER BY sort_order ASC');
    return sendResponse(res, true, 'Thành công', rows);
  } catch (err) { next(err); }
};

export const updateBanner = async (req, res, next) => {
  try {
    const { id, image_url, link_url, status, sort_order } = req.body;
    if (id) {
      await pool.query(
        'UPDATE banners SET image_url = ?, link_url = ?, status = ?, sort_order = ? WHERE id = ?',
        [image_url, link_url, status, sort_order, id]
      );
    } else {
      await pool.query(
        'INSERT INTO banners (image_url, link_url, status, sort_order) VALUES (?, ?, ?, ?)',
        [image_url, link_url, status, sort_order]
      );
    }

    // Standard Log
    await logAdminAction(req.user?.id, id ? 'UPDATE_BANNER' : 'CREATE_BANNER', `Banner: ${image_url}`, req.body, req.ip);

    return sendResponse(res, true, 'Thành công');
  } catch (err) { next(err); }
};

export const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM banners WHERE id = ?', [id]);
    return sendResponse(res, true, 'Đã xóa');
  } catch (err) { next(err); }
};


/**
 * Quản lý Thông báo (Thông báo toàn hệ thống hoặc cá nhân)
 */
export const getNotifications = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notifications ORDER BY id DESC');
    return sendResponse(res, true, 'Thành công', rows);
  } catch (err) { next(err); }
};

export const createNotification = async (req, res, next) => {
  try {
    const { title, content, type, user_id, status } = req.body;
    
    // Ensure user_id is properly handled for INT column
    let targetUserId = null;
    if (type === 'user' && user_id) {
        targetUserId = parseInt(user_id);
    }

    await pool.query(
      'INSERT INTO notifications (title, content, type, user_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, type || 'all', targetUserId, status || 1, Date.now()]
    );
    return sendResponse(res, true, 'Đã tạo thông báo');
  } catch (err) { 
    console.error('[ERROR] createNotification:', err);
    next(err); 
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM notifications WHERE id = ?', [id]);
    return sendResponse(res, true, 'Đã xóa thông báo');
  } catch (err) { next(err); }
};

/**
 * Đổi mật khẩu Admin
 */
export const updateAdminPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const bcrypt = await import('bcrypt');
    const salt = await bcrypt.default.genSalt(10);
    const hash = await bcrypt.default.hash(newPassword, salt);

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id]);
    return sendResponse(res, true, 'Đã đổi mật khẩu Admin thành công');
  } catch (err) { next(err); }
};

export const getInviteCodes = async (req, res, next) => {
  try {
    const role = req.user.role;
    const agentId = req.user.agent_id;
    let whereClause = '';
    let params = [];

    if (role === 'agent') {
      whereClause = ' WHERE ic.user_id = ?';
      params.push(req.user.id);
    } else if (role === 'cskh' && agentId) {
      whereClause = ' WHERE ic.user_id = ?';
      params.push(agentId);
    }

    const [rows] = await pool.query(`
      SELECT ic.*, u.phone as agent_phone, u.name_user as agent_username 
      FROM invite_codes ic 
      LEFT JOIN users u ON ic.user_id = u.id 
      ${whereClause}
      ORDER BY ic.id DESC
    `, params);
    return sendResponse(res, true, 'Thành công', rows);
  } catch (err) { next(err); }
};

export const createInviteCode = async (req, res, next) => {
  try {
    const { code, remark } = req.body;
    let { user_id } = req.body;
    const role = req.user.role;

    if (role === 'agent') {
      user_id = req.user.id;
    } else if (role === 'cskh') {
      user_id = req.user.agent_id;
    }

    await pool.query(
      'INSERT INTO invite_codes (code, user_id, remark, created_at) VALUES (?, ?, ?, ?)',
      [code, user_id || null, remark || null, Date.now()]
    );
    await logAdminAction(req.user.id, 'CREATE_INVITE_CODE', `Code: ${code}`, { user_id, remark }, req.ip);
    return sendResponse(res, true, 'Đã tạo mã mời');
  } catch (err) { next(err); }
};

export const updateInviteCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, user_id, remark, status } = req.body;
    
    // Security check: Ensure Agent/CSKH can only edit their own network's codes
    if (req.user.role !== 'admin') {
      const bossId = req.user.role === 'agent' ? req.user.id : req.user.agent_id;
      const [[check]] = await pool.query('SELECT id FROM invite_codes WHERE id = ? AND user_id = ?', [id, bossId]);
      if (!check) return sendResponse(res, false, 'Bạn không có quyền chỉnh sửa mã mời này.');
    }

    await pool.query(
      'UPDATE invite_codes SET code = ?, user_id = ?, remark = ?, status = ? WHERE id = ?',
      [code, user_id || null, remark || null, status ?? 1, id]
    );
    await logAdminAction(req.user.id, 'UPDATE_INVITE_CODE', `ID: ${id}`, { code, user_id, status }, req.ip);
    return sendResponse(res, true, 'Đã cập nhật mã mời');
  } catch (err) { next(err); }
};

export const deleteInviteCode = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Security check
    if (req.user.role !== 'admin') {
      const bossId = req.user.role === 'agent' ? req.user.id : req.user.agent_id;
      const [[check]] = await pool.query('SELECT id FROM invite_codes WHERE id = ? AND user_id = ?', [id, bossId]);
      if (!check) return sendResponse(res, false, 'Bạn không có quyền xóa mã mời này.');
    }

    await pool.query('DELETE FROM invite_codes WHERE id = ?', [id]);
    await logAdminAction(req.user.id, 'DELETE_INVITE_CODE', `ID: ${id}`, null, req.ip);
    return sendResponse(res, true, 'Đã xóa mã mời');
  } catch (err) { next(err); }
};

export const logAdminAction = async (adminId, action, target, details, ip) => {
  try {
    await pool.query(
      'INSERT INTO audit_logs (admin_id, action, target, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [adminId, action, target, JSON.stringify(details), ip, Date.now()]
    );

    // Gửi thông báo thao tác Admin qua Telegram
    const [adminRows] = await pool.query('SELECT phone FROM users WHERE id = ?', [adminId]);
    const adminPhone = adminRows.length > 0 ? adminRows[0].phone : 'Unknown';

    sendTelegramAdmin(`
<b>⚡️ HÀNH ĐỘNG QUẢN TRỊ</b>
━━━━━━━━━━━━━━━━━━
🕹 Admin: <code>${adminPhone}</code>
🛠 Hành động: <b>${action}</b>
🎯 Mục tiêu: <code>${target}</code>
💻 IP: <code>${ip}</code>
📝 Chi tiết: <code>${JSON.stringify(details)}</code>
📅 Thời gian: ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━
<i>🔐 Đây là hoạt động giám sát tính minh bạch của hệ thống.</i>
    `);
  } catch (err) { console.error('Log Error:', err); }
};

