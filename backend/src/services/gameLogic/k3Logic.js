/**
 * K3 Logic Standard (5K3, 10K3)
 * Dice: 3 balls (1-6)
 */

export const generateResult = () => {
  return [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1
  ];
};

export const getOdds = (betCode, oddsConfig = {}) => {
  if (!oddsConfig) return 1.98;
  
  // 1. Check direct match (e.g. "ball1-b", "sum-10")
  if (oddsConfig[betCode] !== undefined) return oddsConfig[betCode];

  // 2. Fallback to common
  return oddsConfig.common || 1.98;
};

export const checkWin = (betCode, result) => {
  const [d1, d2, d3] = result.map(Number);
  const sum = d1 + d2 + d3;
  const isTriple = (d1 === d2 && d2 === d3);

  // 1. Tổng cả 2 bên (Big, Small, Odd, Even, Dragon, Tiger)
  if (betCode === 'b') return sum >= 11 && !isTriple; // Đại
  if (betCode === 's') return sum <= 10 && !isTriple; // Tiểu
  if (betCode === 'l') return sum % 2 !== 0 && !isTriple; // Đơn
  if (betCode === 'c') return sum % 2 === 0 && !isTriple; // Đôi
  if (betCode === 'rong') return d1 > d3; // Rồng
  if (betCode === 'ho') return d1 < d3;   // Hổ

  // 2. Từng quả bóng (BSOE & Numbers) - ball1-b, ball1-1
  if (betCode.startsWith('ball')) {
    const parts = betCode.split('-');
    const ballIdx = parseInt(parts[0].replace('ball', '')) - 1;
    const val = result[ballIdx];
    const type = parts[1];

    if (type === 'b') return val >= 4;
    if (type === 's') return val <= 3;
    if (type === 'l') return val % 2 !== 0;
    if (type === 'c') return val % 2 === 0;
    
    if (!isNaN(type)) return val === parseInt(type);
  }

  // 3. Con số tổng hợp
  if (betCode.startsWith('sum-')) {
    const sumValue = parseInt(betCode.replace('sum-', ''));
    return sum === sumValue;
  }

  // 4. Cùng Một Số (Pairs) - pair-1
  if (betCode.startsWith('pair-')) {
    const num = parseInt(betCode.replace('pair-', ''));
    const count = result.filter(x => x === num).length;
    return count >= 2;
  }

  // 5. Số Yard liên tiếp (Triples) - triple-1
  if (betCode.startsWith('triple-')) {
    const num = parseInt(betCode.replace('triple-', ''));
    return d1 === num && d2 === num && d3 === num;
  }

  return false;
};
