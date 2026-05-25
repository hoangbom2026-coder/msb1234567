import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mbs_secret_key_2024';

export const handleUserAuth = (socket) => {
  socket.on('auth', async (data) => {
    try {
      const { token } = data;
      if (!token) return socket.emit('authResponse', { status: false, message: 'Missing token' });

      const decoded = jwt.verify(token, JWT_SECRET);
      const [users] = await pool.query('SELECT id, money, status FROM users WHERE id = ?', [decoded.id]);
      
      if (users.length === 0 || users[0].status !== 1) {
        return socket.emit('authResponse', { status: false, message: 'User invalid' });
      }

      const user = users[0];
      socket.userId = user.id;
      
      // Rời khỏi tất cả các phòng user cũ trước khi join mới
      const currentRooms = Array.from(socket.rooms);
      currentRooms.forEach(room => {
        if (room.startsWith('user_')) socket.leave(room);
      });

      socket.join(`user_${user.id}`);
      socket.emit('authResponse', { status: true });
      socket.emit('balanceUpdate', { money: parseFloat(user.money) });

    } catch (err) {
      socket.emit('authResponse', { status: false, message: 'Invalid token' });
    }
  });
};
