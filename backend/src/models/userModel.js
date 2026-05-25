import pool from '../config/database.js';

export const findByPhone = async (phone) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE phone = ?', [phone]);
  return rows[0] || null;
};

export const findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] || null;
};

export const findByReferralCode = async (code) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE code = ?', [code]);
    return rows;
};

export const updateBalance = async (userId, amount, transactionType, description, referenceId = null, connection = pool) => {
  const conn = (connection === pool) ? await pool.getConnection() : connection;
  try {
    if (connection === pool) await conn.beginTransaction();
    const [userRows] = await conn.query('SELECT money FROM users WHERE id = ? FOR UPDATE', [userId]);
    const user = userRows[0];
    if (!user) throw new Error('User not found');
    const balanceBefore = parseFloat(user.money);
    const balanceAfter = balanceBefore + amount;
    if (balanceAfter < 0) throw new Error('Số dư không đủ');
    await conn.query('UPDATE users SET money = ? WHERE id = ?', [balanceAfter, userId]);
    
    // Log to correct transaction table if needed, or a general transaction_history
    // For now we use the standardized tables like 'recharge' or 'withdraw' or a new 'transactions' table
    
    if (connection === pool) await conn.commit();
  } catch (error) {
    if (connection === pool) await conn.rollback();
    throw error;
  } finally {
    if (connection === pool) conn.release();
  }
};
