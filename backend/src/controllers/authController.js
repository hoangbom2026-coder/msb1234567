import pool from '../config/database.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { sendTelegramAdmin } from '../utils/telegram.js';

const JWT_SECRET = process.env.JWT_SECRET;

const generateInviteCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Đăng ký người dùng mới (Mọi user đăng ký mới ĐỀU là 'user' - KHÔNG CÓ CỬA HẬU)
 */
export const register = async (req, res, next) => {
  try {
    const { phone, password, fullName, invite, username } = req.body;

    // Use username as phone if phone is not provided
    const finalPhone = phone || username;
    const finalFullName = fullName || username || 'User';

    if (!finalPhone || !password) {
      return res.status(400).json({ status: false, message: 'Vui lòng điền đủ tên đăng nhập và mật khẩu' });
    }

    // 1. Validate Phone Number (only if provided and looks like a phone)
    if (phone && /^\d{10}$/.test(phone)) {
        // passed
    }

    // 2. Name validation removed for simplicity

    // 3. Username and Password cannot be the same
    if (username && username === password) {
        return res.status(400).json({ status: false, message: 'Tên đăng nhập và mật khẩu không được trùng nhau' });
    }
    if (phone === password) {
        return res.status(400).json({ status: false, message: 'Số điện thoại và mật khẩu không được trùng nhau' });
    }

    // Check existing phone/username
    const [existingPhone] = await pool.query('SELECT id FROM users WHERE phone = ?', [finalPhone]);
    if (existingPhone.length > 0) {
      return res.status(400).json({ status: false, message: 'Tên đăng nhập hoặc số điện thoại đã được đăng ký' });
    }

    // Check existing username (if provided)
    const finalUsername = username || phone;
    const [existingUser] = await pool.query('SELECT id FROM users WHERE name_user = ?', [finalUsername]);
    if (existingUser.length > 0 && finalUsername !== phone) {
      return res.status(400).json({ status: false, message: 'Tên đăng nhập đã tồn tại' });
    }

    // Verify invite code and find Agent ID
    let agentId = null;
    if (invite) {
      // 1. Check if it's a code from invite_codes table (managed codes)
      const [fixedCode] = await pool.query('SELECT user_id FROM invite_codes WHERE code = ? AND status = 1', [invite]);
      
      if (fixedCode.length > 0) {
          const ownerId = fixedCode[0].user_id;
          // Check if owner is an agent or admin
          const [[owner]] = await pool.query('SELECT id, role, agent_id FROM users WHERE id = ?', [ownerId]);
          if (owner) {
             agentId = owner.role === 'agent' ? owner.id : owner.agent_id;
          }
      } else {
          // 2. Check if it's a direct referral from a user's code
          const [[referrer]] = await pool.query('SELECT id, role, agent_id FROM users WHERE code = ?', [invite]);
          if (!referrer) {
              return res.status(400).json({ status: false, message: 'Mã giới thiệu không hợp lệ' });
          }
          // If referrer is Agent, use their ID. If CSKH/User, use their agent_id
          agentId = referrer.role === 'agent' ? referrer.id : (referrer.agent_id || null);
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const inviteCode = generateInviteCode();
    const now = Date.now();

    await pool.query(
      'INSERT INTO users (phone, password, name_real, name_user, code, invite, role, status, money, agent_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [finalPhone, passwordHash, finalFullName, finalUsername || finalPhone, inviteCode, invite || '', 'user', 1, 0, agentId, now, now]
    );

    // Thông báo Telegram
    sendTelegramAdmin(`
<b>🆕 HỘI VIÊN MỚI ĐĂNG KÝ</b>
━━━━━━━━━━━━━━━━━━
👤 Tài khoản: <code>${finalPhone}</code>
📛 Họ tên: <b>${finalFullName}</b>
🆔 Username: <code>${finalUsername}</code>
🎟 Mã mời: <code>${invite || 'Không có'}</code>
📅 Thời gian: ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━
<i>👉 Hệ thống MARINA BAY SANDS vừa đón thêm 1 thành viên mới.</i>
    `);

    return res.status(201).json({ status: true, message: 'Đăng ký thành công' });
  } catch (err) {
    console.error('Registration Error:', err);
    next(err);
  }
};

/**
 * Đăng nhập
 */
export const login = async (req, res, next) => {
  try {
    const { phone, password, username } = req.body;
    const identifier = phone || username;

    if (!identifier || !password) {
      return res.status(400).json({ status: false, message: 'Vui lòng nhập tài khoản và mật khẩu' });
    }

    const [rows] = await pool.query(
      'SELECT id, phone, password, role, status, money, name_user, name_real FROM users WHERE phone = ? OR name_user = ?',
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res.status(401).json({ status: false, message: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    const user = rows[0];

    // Khóa tài khoản
    if (user.status !== 1) {
      return res.status(403).json({ status: false, message: 'Tài khoản đã bị khóa' });
    }

    // Xác thực mật khẩu
    let isMatch = false;
    if (user.password.length === 60 || user.password.startsWith('$2')) {
        isMatch = await bcrypt.compare(password, user.password);
    } else {
        isMatch = (password === user.password);
        if (isMatch) {
            const salt = await bcrypt.genSalt(10);
            const upgradedHash = await bcrypt.hash(password, salt);
            await pool.query('UPDATE users SET password = ? WHERE id = ?', [upgradedHash, user.id]);
        }
    }

    if (!isMatch) {
      return res.status(401).json({ status: false, message: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    // Ký JWT Token với dữ liệu an toàn
    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      status: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        username: user.name_user,
        fullName: user.name_real,
        role: user.role,
        money: parseFloat(user.money || 0)
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    next(err);
  }
};
