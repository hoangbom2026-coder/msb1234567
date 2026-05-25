import pool from '../config/database.js';
import * as k3Logic from '../services/gameLogic/k3Logic.js';
import * as fiveDLogic from '../services/gameLogic/fiveDLogic.js';
import * as wingoLogic from '../services/gameLogic/wingoLogic.js';
import * as profitService from '../services/profitService.js';
import { generatePeriod } from '../utils/helpers.js';
import { logTransaction } from '../middleware/transactionLogger.js';
import { getIO } from '../config/socket.js';

const processingRooms = new Set();

export const startScheduler = () => {
  // Chạy mỗi giây để kiểm tra và đồng bộ hóa
  setInterval(async () => {
    try {
      const now = Date.now();
      const [rooms] = await pool.query('SELECT * FROM game_rooms WHERE status = 1');
      const io = getIO();

      for (const room of rooms) {
        // Tránh xử lý song song cho cùng một phòng
        if (processingRooms.has(room.id)) continue;
        
        const roomTag = `room_${room.game_id}`;

        // 1. Lấy phiên hiện tại đang mở (status = 0)
        // Lấy phiên CŨ NHẤT chưa xử lý để đảm bảo không bỏ sót phiên nào
        const [activeSessions] = await pool.query(
          'SELECT id, period, end_time FROM game_sessions WHERE room_id = ? AND status = 0 ORDER BY end_time ASC LIMIT 1',
          [room.id]
        );

        if (activeSessions.length > 0) {
          const current = activeSessions[0];
          const timeLeft = Math.max(0, Math.floor((current.end_time - now) / 1000));

          // Chỉ gửi tick cho phiên "đang diễn ra" (phiên có end_time gần nhất trong tương lai)
          // Nếu đang catch-up (end_time < now), không gửi tick để tránh loạn frontend
          if (current.end_time > now - 1000) {
              io.to(roomTag).emit('tick', {
                period: current.period,
                timeLeft,
                endTime: current.end_time
              });
          }

          // 2. Kiểm tra nếu phiên này đã hết hạn thì xử lý trả thưởng
          if (now >= current.end_time) {
            processingRooms.add(room.id);
            // Xử lý payout (hàm này có transaction và lock)
            processSessionPayout(room, current)
              .catch(err => console.error(`[Payout Error Room ${room.id}]`, err))
              .finally(() => processingRooms.delete(room.id));
          }
        } else {
          // 3. Watchdog: Nếu không có phiên nào đang mở, tạo phiên mới đồng bộ theo clock
          console.log(`[Watchdog] Khởi tạo phiên mới cho phòng: ${room.name}`);
          
          const cycleMs = room.cycle_seconds * 1000;
          // Làm tròn xuống thời điểm bắt đầu của chu kỳ hiện tại
          const currentCycleStart = Math.floor(now / cycleMs) * cycleMs;
          const finalEndTime = currentCycleStart + cycleMs;
          const nextStartTime = currentCycleStart;

          const nextPeriod = generatePeriod(room, finalEndTime);

          try {
            await pool.query(
              'INSERT IGNORE INTO game_sessions (room_id, period, start_time, end_time, status, created_at) VALUES (?, ?, ?, ?, 0, ?)',
              [room.id, nextPeriod, nextStartTime, finalEndTime, now]
            );
            
            io.to(roomTag).emit('sessionUpdate', { period: nextPeriod, endTime: finalEndTime });
          } catch (insertErr) {
            console.error(`[Watchdog] Insert error for room ${room.id}:`, insertErr);
          }
        }
      }
    } catch (err) { 
      console.error('[Scheduler Error]', err); 
    }
  }, 1000);
};

const processSessionPayout = async (room, session) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Lock session to prevent double processing and read the LATEST session data (including manual results)
    const [checkSessions] = await connection.query('SELECT * FROM game_sessions WHERE id = ? FOR UPDATE', [session.id]);
    const currentSession = checkSessions[0];

    if (!currentSession || currentSession.status !== 0) {
      await connection.rollback();
      return;
    }

    await connection.query('UPDATE game_sessions SET status = 1 WHERE id = ?', [session.id]);
    const [bets] = await connection.query('SELECT * FROM bets WHERE session_id = ? AND status = 0', [session.id]);

    let result = currentSession.result;
    
    // If result is a string (some MySQL drivers return JSON as string), parse it
    if (typeof result === 'string') {
      try { result = JSON.parse(result); } catch (e) {}
    }

    // If result is still not set (null or undefined), generate it
    if (result === null || result === undefined) {
      let count = 3; // Default for K3
      let max = 6;   // Default for K3 dice
      let minVal = 1;

      if (room.type === 'k3') {
        count = 3; max = 6; minVal = 1;
      } else if (room.type === '5d') {
        if (room.game_id.includes('LUCKY_SPACE') || room.game_id.includes('SPEED_PRO')) {
          count = 8; max = 8; minVal = 1;
        } else {
          count = 10; max = 9; minVal = 0;
        }
      } else if (room.type === 'wingo') {
        count = 1; max = 9; minVal = 0;
      }

      // Probability 70/30 of manipulation
      const shouldManipulate = Math.random() < 0.70;
      let generatedResult;

      if (shouldManipulate && bets.length > 0) {
          generatedResult = await profitService.findBestResultForHouse(room, bets, count, max);
      } else {
          if (room.type === 'k3') generatedResult = k3Logic.generateResult();
          else if (room.type === '5d') generatedResult = fiveDLogic.generateResult(count, minVal, max);
          else if (room.type === 'wingo') generatedResult = wingoLogic.generateResult(minVal, max);
          else generatedResult = Array(count).fill(0);
      }

      result = generatedResult;
      await connection.query('UPDATE game_sessions SET result = ? WHERE id = ?', [JSON.stringify(result), session.id]);
    }

    let totalPayout = 0;
    const io = getIO();
    const today = new Date().toISOString().split('T')[0];

    for (const bet of bets) {
      let isWin = false;
      // Check win condition based on game type
      if (room.type === 'k3') isWin = k3Logic.checkWin(bet.bet_value, result);
      else if (room.type === '5d') isWin = fiveDLogic.checkWin(bet.bet_value, result);
      else if (room.type === 'wingo') isWin = wingoLogic.checkWin(bet.bet_value, result);

      const betAmount = parseFloat(bet.amount);
      // Update Daily Stats: Total Bet
      await connection.query(
        'INSERT INTO daily_stats (user_id, stat_date, total_bet, total_win) VALUES (?, ?, ?, 0) ON DUPLICATE KEY UPDATE total_bet = total_bet + ?',
        [bet.user_id, today, betAmount, betAmount]
      );

      if (isWin) {
        // Use odds directly from the bet record
        const odds = parseFloat(bet.odds || 1.98);
        const winAmount = betAmount * odds; // Payout = Bet * Multiplier

        totalPayout += winAmount;
        await connection.query('UPDATE bets SET status = 1, win_amount = ? WHERE id = ?', [winAmount, bet.id]);
        await connection.query('UPDATE users SET money = money + ? WHERE id = ?', [winAmount, bet.user_id]);

        // Update Daily Stats: Total Win
        await connection.query(
          'UPDATE daily_stats SET total_win = total_win + ? WHERE user_id = ? AND stat_date = ?',
          [winAmount, bet.user_id, today]
        );

        // Log win transaction
        logTransaction({
          type: 'win',
          userId: bet.user_id,
          amount: winAmount,
          orderId: `BET-${bet.id}`,
          status: 'success',
          description: `Thắng cược - Phần thưởng: ${winAmount}`,
          extraData: {
            betAmount: betAmount,
            odds: odds,
            period: session.period,
            betCode: bet.bet_value
          }
        });

        // Emit balance update to the specific user
        const [u] = await connection.query('SELECT id, money FROM users WHERE id = ?', [bet.user_id]);
        if (u.length > 0) {
          io.to(`user_${u[0].id}`).emit('balanceUpdate', { money: u[0].money });
        }
      } else {
        await connection.query('UPDATE bets SET status = 2 WHERE id = ?', [bet.id]);

        // Log loss transaction
        logTransaction({
          type: 'loss',
          userId: bet.user_id,
          amount: -betAmount, // Log as negative amount for loss
          orderId: `BET-${bet.id}`,
          status: 'success', // Status is 'success' for logging, not for client display
          description: `Thua cược - Mất: ${betAmount}`,
          extraData: {
            period: session.period,
            betCode: bet.bet_value
          }
        });
      }
    }

    await connection.query('UPDATE game_sessions SET status = 2, total_payout = ? WHERE id = ?', [totalPayout, session.id]);

    // Prepare next session
    const cycleMs = room.cycle_seconds * 1000;
    const nextStartTime = session.end_time;
    const nextEndTime = nextStartTime + cycleMs;
    const nextPeriod = generatePeriod(room, nextEndTime);

    // Insert new session if it doesn't exist (using INSERT IGNORE to prevent duplicates)
    await connection.query(
      'INSERT IGNORE INTO game_sessions (room_id, period, start_time, end_time, status, created_at) VALUES (?, ?, ?, ?, 0, ?)',
      [room.id, nextPeriod, nextStartTime, nextEndTime, Date.now()]
    );

    await connection.commit();

    // Broadcast result and next session update
    const finalResult = Array.isArray(result) ? result : [result];
    const targetRoom = `room_${room.game_id}`;
    io.to(targetRoom).emit('result', { period: session.period, result: finalResult, room_id: room.id });
    io.to(targetRoom).emit('sessionUpdate', { period: nextPeriod, endTime: nextEndTime });

  } catch (error) {
    await connection.rollback();
    console.error(`[PAYOUT ERROR] Session ${session.id} for room ${room.id}:`, error);
  } finally {
    connection.release();
  }
};

