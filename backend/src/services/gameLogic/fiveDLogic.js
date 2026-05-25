/**
 * 5D Logic Standard (Lucky Spac, Speed Pro, etc.)
 */

export const generateResult = (count = 5, min = 0, max = 9) => {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return result;
};

export const checkWin = (betCode, result) => {
  const nums = result.map(Number);
  
  // Per position bets: "pos0-b", "pos0-1"
  if (betCode.startsWith('pos')) {
    const match = betCode.match(/pos(\d+)-(.+)/);
    if (match) {
      const idx = parseInt(match[1]);
      const type = match[2];
      const val = nums[idx];

      if (type === 'b') return val >= 5;
      if (type === 's') return val <= 4;
      if (type === 'l') return val % 2 !== 0; // Đơn
      if (type === 'c') return val % 2 === 0; // Đôi
      
      // Dragon/Tiger (positional comparison)
      if (type === 'rong') return nums[idx] > nums[result.length - 1 - idx];
      if (type === 'ho') return nums[idx] < nums[result.length - 1 - idx];

      if (!isNaN(type)) return val === parseInt(type);
    }
  }

  // Common sum bets if added later (b, s, l, c)
  const sum = nums.reduce((a, b) => a + b, 0);
  const avg = (result.length * 4.5);
  if (betCode === 'b') return sum >= avg;
  if (betCode === 's') return sum < avg;
  if (betCode === 'l') return sum % 2 !== 0;
  if (betCode === 'c') return sum % 2 === 0;

  return false;
};

export const getOdds = (betCode, oddsConfig = {}) => {
  if (!oddsConfig) return 1.98;

  // 1. Check direct match (e.g. "pos0-b", "pos0-1")
  if (oddsConfig[betCode] !== undefined) return oddsConfig[betCode];

  // 2. Fallback to generic number odds if it's a number bet
  if (betCode.includes('-')) {
    const type = betCode.split('-')[1];
    if (!isNaN(type)) {
      return oddsConfig.number || oddsConfig.special || oddsConfig.common || 9.0;
    }
  }

  // 3. Fallback to common
  return oddsConfig.common || 1.98;
};
