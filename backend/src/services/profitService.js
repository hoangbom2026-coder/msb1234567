import * as k3Logic from './gameLogic/k3Logic.js';
import * as wingoLogic from './gameLogic/wingoLogic.js';
import * as fiveDLogic from './gameLogic/fiveDLogic.js';

/**
 * Quyết định kết quả phiên dựa trên houseEdgePercent (0-100).
 *   0   → luôn random
 *   100 → luôn chọn kết quả bất lợi nhất cho người chơi
 * Giá trị trung gian: xác suất tỷ lệ thuận với houseEdgePercent.
 *
 * @param {object} room
 * @param {Array}  bets
 * @param {number} houseEdgePercent - 0..100, đọc từ profit_schedule
 * @param {number} count
 * @param {number|null} max
 */
export const findBestResultForHouse = async (room, bets, houseEdgePercent = 70, count = 3, max = null) => {
  if (bets.length === 0) return generateRandomResult(room, count, max);

  // Xác suất kích hoạt house-edge manipulation
  const shouldManipulate = Math.random() * 100 < houseEdgePercent;
  if (!shouldManipulate) return generateRandomResult(room, count, max);

  if (room.type === 'wingo') return optimizeWingo(bets);
  if (room.type === 'k3') return optimizeK3(bets);
  if (room.type === '5d') return optimize5D(bets, count, max || 9);

  return generateRandomResult(room, count, max);
};

const generateRandomResult = (room, count, max = null) => {
  if (room.type === 'k3') return k3Logic.generateResult();
  if (room.type === 'wingo') return wingoLogic.generateResult();
  return fiveDLogic.generateResult(count, 0, max || 9);
};

const getTotalPayout = (bet) => {
  const amount = parseFloat(bet.amount);
  const odds = parseFloat(bet.odds || 1.98);
  return amount * (odds + 1);
};

const optimizeWingo = (bets) => {
  let bestRes = [0];
  let minPayout = Infinity;
  for (let num = 0; num <= 9; num++) {
    let currentPayout = 0;
    for (const bet of bets) {
      if (wingoLogic.checkWin(bet.bet_value, [num])) {
        currentPayout += getTotalPayout(bet);
      }
    }
    if (currentPayout < minPayout) { minPayout = currentPayout; bestRes = [num]; }
  }
  return bestRes;
};

const optimizeK3 = (bets) => {
  let bestDice = [1, 1, 1];
  let minPayout = Infinity;
  for (let d1 = 1; d1 <= 6; d1++) {
    for (let d2 = 1; d2 <= 6; d2++) {
      for (let d3 = 1; d3 <= 6; d3++) {
        const res = [d1, d2, d3];
        let currentPayout = 0;
        for (const bet of bets) {
          if (k3Logic.checkWin(bet.bet_value, res)) {
            currentPayout += getTotalPayout(bet);
          }
        }
        if (currentPayout < minPayout) { minPayout = currentPayout; bestDice = res; }
      }
    }
  }
  return bestDice;
};

const optimize5D = (bets, count, max) => {
  const bestResult = [];
  const minVal = 0;
  
  // For each position, find the digit that minimizes payout locally
  // This is a greedy approach for 5D to avoid O(max^count) complexity
  for (let i = 0; i < count; i++) {
    let bestDigit = minVal;
    let minPayoutAtPos = Infinity;

    for (let digit = minVal; digit <= max; digit++) {
      let currentPayout = 0;
      for (const bet of bets) {
        // Mock a result where current position is 'digit'
        const mockResult = new Array(count).fill(0);
        mockResult[i] = digit;
        // checkWin for 5D handles positional bets like "pos0-1"
        if (fiveDLogic.checkWin(bet.bet_value, mockResult)) {
            currentPayout += getTotalPayout(bet);
        }
      }
      if (currentPayout < minPayoutAtPos) {
        minPayoutAtPos = currentPayout;
        bestDigit = digit;
      }
    }
    bestResult.push(bestDigit);
  }
  return bestResult;
};
