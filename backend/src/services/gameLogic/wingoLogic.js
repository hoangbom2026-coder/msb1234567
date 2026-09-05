import pool from '../../config/database.js';

export const generateResult = (min = 0, max = 9) => {
  return [Math.floor(Math.random() * (max - min + 1)) + min];
};

export const checkWin = (betCode, result) => {
  const num = Number(result[0]);

  if (betCode === 'b') return num >= 5; // Tài
  if (betCode === 's') return num <= 4; // Xỉu
  if (betCode === 'l') return num % 2 !== 0; // Đơn (lẻ)
  if (betCode === 'c') return num % 2 === 0; // Đôi (chẵn)

  // Direct number bet
  if (!isNaN(betCode)) {
    return num === Number(betCode);
  }

  // Color bets — tiêu chuẩn Wingo:
  // violet: 0 và 5 (thắng cả violet lẫn red/green)
  // green:  1, 3, 7, 9 (đơn không phải 5) và 5 (violet+green)
  // red:    2, 4, 6, 8 (chẵn không phải 0) và 0 (violet+red)
  if (betCode === 'violet') return num === 0 || num === 5;
  if (betCode === 'green')  return num === 1 || num === 3 || num === 5 || num === 7 || num === 9;
  if (betCode === 'red')    return num === 0 || num === 2 || num === 4 || num === 6 || num === 8;

  return false;
};

export const getOdds = (betCode, oddsConfig = {}) => {
  if (!oddsConfig) return 1.98;

  // 1. Check direct match (e.g. "green", "0", "b")
  if (oddsConfig[betCode] !== undefined) return oddsConfig[betCode];

  // 2. Fallback to generic categories if direct match fails
  if (!isNaN(betCode)) {
    return oddsConfig.number || oddsConfig.special || oddsConfig.common || 9.0;
  }

  // 3. Fallback to common
  return oddsConfig.common || 1.98;
};
