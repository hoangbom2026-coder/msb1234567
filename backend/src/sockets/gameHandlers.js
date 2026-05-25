import pool from '../config/database.js';
import * as k3Logic from '../services/gameLogic/k3Logic.js';
import * as fiveDLogic from '../services/gameLogic/fiveDLogic.js';
import * as wingoLogic from '../services/gameLogic/wingoLogic.js';

export const handleJoinGame = (io, socket) => {
  socket.on('joinGame', (data) => {
    const { roomId, gameType } = data;
    const room = roomId || gameType; 
    if (room) {
      socket.join(`room_${room}`);
      console.log(`User ${socket.id} joined room ${room}`);
    }
  });
};

export const handlePlaceBet = (io, socket) => {
  socket.on('placeBet', async (data) => {
    console.log(`[DEBUG] Received bet from ${socket.user?.id || 'Guest'}:`, JSON.stringify(data));
    const connection = await pool.getConnection();
    try {
      const { roomId, bets } = data; // bets: [{ code: 'b', amount: 1000 }]
      const user = socket.user;

      if (!user) throw new Error('Vui lòng đăng nhập để đặt cược');
      const userId = user.id;

      await connection.beginTransaction();

      // 1. Kiểm tra phiên hiện tại (phải đang mở cược)
      const [sessions] = await connection.query(
        'SELECT s.id, s.period, s.end_time, r.name, r.type, r.id as room_id, r.odds FROM game_sessions s JOIN game_rooms r ON s.room_id = r.id WHERE (r.id = ? OR r.game_id = ?) AND s.status = 0 ORDER BY s.end_time ASC LIMIT 1',
        [roomId, roomId]
      );

      if (sessions.length === 0) throw new Error('Không có phiên nào đang mở');
      const session = sessions[0];
      
      let oddsConfig = session.odds;
      if (typeof oddsConfig === 'string') {
        try { oddsConfig = JSON.parse(oddsConfig); } catch (e) { oddsConfig = {}; }
      }
      
      // Chặn cược 5 giây cuối
      if (Date.now() > session.end_time - 5000) throw new Error('Đã hết thời gian đặt cược cho phiên này');

      // 2. Tính tổng tiền cược và kiểm tra số dư
      const [users] = await connection.query('SELECT money FROM users WHERE id = ? FOR UPDATE', [userId]);
      const userData = users[0];

      let totalAmount = bets.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
      if (parseFloat(userData.money) < totalAmount) throw new Error('Số dư tài khoản không đủ');

      // 3. Trừ tiền
      await connection.query('UPDATE users SET money = money - ? WHERE id = ?', [totalAmount, userId]);

      for (const bet of bets) {
        let odds = 1.98;
        if (session.type === 'wingo') odds = wingoLogic.getOdds(bet.code, oddsConfig);
        else if (session.type === 'k3') odds = k3Logic.getOdds(bet.code, oddsConfig);
        else if (session.type === '5d') odds = fiveDLogic.getOdds(bet.code, oddsConfig);

        const [betResult] = await connection.query(
          'INSERT INTO bets (user_id, room_id, session_id, period, bet_value, amount, odds, status, time) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)',
          [userId, session.room_id, session.id, session.period, bet.code, bet.amount, odds, Date.now()]
        );

        // Import logTransaction internally to avoid circular dependencies if any
        const { logTransaction } = await import('../middleware/transactionLogger.js');
        logTransaction({
          type: 'bet',
          userId,
          phone: user.phone,
          amount: parseFloat(bet.amount),
          orderId: `BET-${betResult.insertId}`,
          status: 'success',
          description: `Đặt cược game ${session.name} - Cửa: ${bet.code}`,
          extraData: { period: session.period, roomId: session.room_id }
        });
      }

      await connection.commit();

      // 4. Phản hồi thành công và cập nhật số dư realtime cho toàn bộ tab/thiết bị của user
      socket.emit('placeBetResponse', { status: true, message: 'Tham gia thành công' });
      
      const [updatedUser] = await pool.query('SELECT money FROM users WHERE id = ?', [userId]);
      // Join user to their own room to broadcast balance updates
      io.to(`user_${userId}`).emit('balanceUpdate', { money: updatedUser[0].money });

    } catch (err) {
      await connection.rollback();
      socket.emit('placeBetResponse', { status: false, message: err.message });
    } finally {
      connection.release();
    }
  });
};
