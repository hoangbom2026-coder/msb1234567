import pool from '../../config/database.js';

export const generateResult = (min = 0, max = 9) => {
  return [Math.floor(Math.random() * (max - min + 1)) + min];
};

export const checkWin = (betCode, result) => {
  const num = Number(result[0]);
  
  if (betCode === 'b') return num >= 5; // Big
  if (betCode === 's') return num <= 4; // Small
  if (betCode === 'l') return num % 2 !== 0; // Odd
  if (betCode === 'c') return num % 2 === 0; // Even
  
  // Direct number bet
  if (!isNaN(betCode)) {
    return num === Number(betCode);
  }
  
  // Color bets (standard wingo)
  if (betCode === 'green') return [1, 3, 7, 9].includes(num) || num === 5;
  if (betCode === 'red') return [2, 4, 6, 8].includes(num) || num === 0;
  if (betCode === 'violet') return [0, 5].includes(num);

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
