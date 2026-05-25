import pool from '../config/database.js';
import { logTransaction } from '../middleware/transactionLogger.js';
import * as helpers from '../utils/helpers.js';
import { getIO } from '../config/socket.js';
import { sendTelegramAdmin } from '../utils/telegram.js';

const sendResponse = helpers.sendResponse;

// Helper to get config from system_config table
const getConfig = async (key, defaultValue) => {
  try {
    const [rows] = await pool.query('SELECT config_value FROM system_config WHERE config_key = ?', [key]);
    return rows.length > 0 ? rows[0].config_value : defaultValue;
  } catch (err) {
    return defaultValue;
  }
};

const generateOrderId = (prefix = 'TR') => {
  return prefix + Date.now() + Math.floor(Math.random() * 1000).toString();
};

export const requestDeposit = async (req, res, next) => {
  try {
    const { money } = req.body;
    const userId = req.user.id;
    const phone = req.user.phone;

    if (!money || isNaN(money) || parseFloat(money) <= 0) {
        return sendResponse(res, false, 'Số tiền không hợp lệ');
    }

    if (!req.file) return sendResponse(res, false, 'Vui lòng cung cấp ảnh xác thực');

    const id_order = generateOrderId('DEP');
    const proof_image = `/uploads/recharge/${req.file.filename}`;
    const today = new Date().toISOString().split('T')[0];
    const amount = parseFloat(money);

    await pool.query(
      'INSERT INTO recharge (id_order, phone, user_id, money, type, status, today, time, proof_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id_order, phone || '', userId, amount, 'bank', 0, today, Date.now(), proof_image]
    );

    logTransaction({
        type: 'recharge', userId, phone, amount, orderId: id_order, status: 'pending', description: 'Yêu cầu nạp tiền'
    });

    const io = getIO();
    io.to('admin_room').emit('rechargeNotification', { orderId: id_order, phone, amount });

    // Thông báo qua Telegram
    sendTelegramAdmin(`
<b>🔔 THÔNG BÁO NẠP TIỀN MỚI</b>
━━━━━━━━━━━━━━━━━━
💰 Số tiền: <b>${amount.toLocaleString()} USDT</b>
👤 Tài khoản: <code>${phone}</code>
🔖 Mã đơn: <code>${id_order}</code>
📅 Thời gian: ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━
<i>👉 Vui lòng truy cập trang Admin để kiểm duyệt đơn này.</i>
    `);

    return sendResponse(res, true, 'Yêu cầu nạp tiền đã được gửi thành công');
  } catch (err) { next(err); }
};

export const requestWithdraw = async (req, res, next) => {
  try {
    const { money, password, passwordV2 } = req.body;
    const userId = req.user.id;
    const pass = password || passwordV2;

    console.log(`[Withdraw DEBUG] Request received for user ${userId}, amount: ${money}`);
    if (!pass) {
        console.log(`[Withdraw DEBUG] Failed: Missing password`);
        return sendResponse(res, false, 'Vui lòng nhập mật khẩu thanh toán');
    }

    const [userRows] = await pool.query('SELECT money, phone, password_v2 FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) {
      console.log(`[Withdraw DEBUG] Failed: User not found`);
      return sendResponse(res, false, 'Tài khoản không tồn tại');
    }
    
    const [bankRows] = await pool.query('SELECT id FROM user_banks WHERE user_id = ? AND status = "active"', [userId]);
    if (bankRows.length === 0) {
      console.log(`[Withdraw DEBUG] Failed: No active bank link`);
      return sendResponse(res, false, 'Vui lòng liên kết ngân hàng trước khi rút tiền');
    }

    if (!userRows[0].password_v2) {
      console.log(`[Withdraw DEBUG] Failed: Transaction password not set`);
      return sendResponse(res, false, 'Bạn chưa thiết lập mật khẩu thanh toán. Vui lòng thiết lập trong phần Bảo mật.');
    }

    const pass_str = pass.toString();
    const hash = helpers.md5(pass_str);
    if (hash !== userRows[0].password_v2) {
      console.log(`[Withdraw DEBUG] Failed: Incorrect password. Hash: ${hash}, DB: ${userRows[0].password_v2}`);
      return sendResponse(res, false, 'Mật khẩu thanh toán không chính xác');
    }

    const amount = parseFloat(money);
    const config_min_withdraw = await getConfig('min_withdraw', '1000');
    if (amount < parseFloat(config_min_withdraw)) {
      console.log(`[Withdraw DEBUG] Failed: Amount ${amount} < min ${config_min_withdraw}`);
      return sendResponse(res, false, `Số tiền rút tối thiểu là ${parseFloat(config_min_withdraw).toLocaleString()} $`);
    }

    if (amount > parseFloat(userRows[0].money)) {
      console.log(`[Withdraw DEBUG] Failed: Insufficient balance. Have: ${userRows[0].money}, Req: ${amount}`);
      return sendResponse(res, false, 'Số dư không đủ để thực hiện giao dịch này');
    }

    console.log(`[Withdraw DEBUG] Checks passed. Proceeding with transaction...`);
    const feePercent = parseFloat(await getConfig('withdraw_fee', '8')) / 100;
    const fee = amount * feePercent;
    const receive_amount = amount - fee;
    const id_order = generateOrderId('WIT');
    const phone = userRows[0].phone;
    const today = new Date().toISOString().split('T')[0];

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Lock user row and re-verify money
      const [lockRows] = await connection.query('SELECT money FROM users WHERE id = ? FOR UPDATE', [userId]);
      if (lockRows.length === 0 || parseFloat(lockRows[0].money) < amount) {
          throw new Error('Số dư không đủ hoặc tài khoản không tồn tại');
      }

      await connection.query('UPDATE users SET money = money - ? WHERE id = ?', [amount, userId]);

      await connection.query(
        'INSERT INTO withdraw (id_order, phone, user_id, money, gross_amount, fee, receive_amount, type, status, today, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id_order, phone || '', userId, amount, amount, fee, receive_amount, 'bank', 0, today, Date.now()]
      );

      await connection.commit();
      console.log(`[Withdraw DEBUG] Transaction committed. Order ID: ${id_order}`);
      
      logTransaction({
          type: 'withdraw', userId, phone, amount, orderId: id_order, status: 'pending', description: 'Yêu cầu rút tiền'
      });

      const io = getIO();
      io.to('admin_room').emit('withdrawNotification', { orderId: id_order, phone, amount });

      // Thông báo qua Telegram
      sendTelegramAdmin(`
<b>🚨 THÔNG BÁO RÚT TIỀN MỚI</b>
━━━━━━━━━━━━━━━━━━
💸 Số tiền: <b>${amount.toLocaleString()} USDT</b>
👤 Tài khoản: <code>${phone}</code>
🔖 Mã đơn: <code>${id_order}</code>
📉 Phí: ${fee.toLocaleString()} | Thực nhận: <b>${receive_amount.toLocaleString()}</b>
📅 Thời gian: ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━
<i>👉 Vui lòng kiểm tra ví và phê duyệt lệnh rút.</i>
      `);

      return sendResponse(res, true, 'Yêu cầu rút tiền thành công, đang chờ phê duyệt', { id_order });
    } catch (e) {
      await connection.rollback();
      console.log(`[Withdraw DEBUG] Transaction rolled back. Error: ${e.message}`);
      return sendResponse(res, false, e.message);
    } finally {
      connection.release();
    }
  } catch (err) { next(err); }
};

export const getDepositHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      'SELECT * FROM recharge WHERE user_id = ? OR phone = ? ORDER BY time DESC LIMIT 50',
      [userId, req.user.phone || '']
    );
    return sendResponse(res, true, 'Thành công', rows);
  } catch (err) { next(err); }
};

export const getWithdrawHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      'SELECT * FROM withdraw WHERE user_id = ? OR phone = ? ORDER BY time DESC LIMIT 50',
      [userId, req.user.phone || '']
    );
    return sendResponse(res, true, 'Thành công', rows);
  } catch (err) { next(err); }
};

export const getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const phone = req.user.phone || '';
    const [recharges] = await pool.query('SELECT *, "recharge" as category FROM recharge WHERE user_id = ? OR phone = ? ORDER BY time DESC LIMIT 50', [userId, phone]);
    const [withdraws] = await pool.query('SELECT *, "withdraw" as category FROM withdraw WHERE user_id = ? OR phone = ? ORDER BY time DESC LIMIT 50', [userId, phone]);
    
    const history = [...recharges, ...withdraws].sort((a, b) => b.time - a.time).slice(0, 50);
    return sendResponse(res, true, 'Thành công', history);
  } catch (err) { next(err); }
};
