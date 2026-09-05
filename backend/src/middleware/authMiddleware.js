import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET env var is not set. Check your .env file.');
  process.exit(1);
}
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token'] || req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ status: false, message: 'Vui lòng đăng nhập' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const [rows] = await pool.query(
      'SELECT id, phone, role, status, money, code, agent_id, invite FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0 || rows[0].status !== 1) {
      console.warn(`[AUTH] Access denied for User ID ${decoded.id}: ${rows.length === 0 ? "Not found" : "Status not 1"}`);
      return res.status(403).json({ status: false, message: 'Tài khoản không hợp lệ hoặc đã bị khóa' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    console.error(`[AUTH] 401 Unauthorized: ${err.message} URL: ${req.url}`);
    return res.status(401).json({ status: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};
export const isAdmin = (req, res, next) => {
  const allowedRoles = ['admin', 'ROOT'];
  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    console.warn(`[AUTH] Admin access denied for User ID ${req.user?.id} (Role: ${req.user?.role}) on URL: ${req.url}`);
    return res.status(403).json({ status: false, message: 'Chức năng này chỉ dành cho Quản trị viên tối cao.' });
  }
};
export const isAgent = (req, res, next) => {
  const allowedRoles = ['agent', 'admin', 'ROOT'];
  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ status: false, message: 'Bạn không có quyền Đại lý.' });
  }
};
export const isCSKH = (req, res, next) => {
  const allowedRoles = ['cskh', 'admin', 'ROOT'];
  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ status: false, message: 'Bạn không có quyền Chăm sóc khách hàng.' });
  }
};
export const isStaff = (req, res, next) => {
  const allowedRoles = ['admin', 'agent', 'cskh', 'ROOT'];
  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ status: false, message: 'Bạn không có quyền truy cập khu vực này.' });
  }
};
