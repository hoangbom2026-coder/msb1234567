import crypto from 'crypto';

/**
 * Mã hóa MD5 chuẩn
 */
export const md5 = (data) => {
  return crypto.createHash('md5').update(data.toString()).digest('hex');
};

/**
 * Định dạng phản hồi API thống nhất
 */
export const sendResponse = (res, status, message, data = null, statusCode) => {
  const code = statusCode || 200;
  return res.status(code).json({
    status,
    message,
    data
  });
};

/**
 * Tạo mã giới thiệu hoặc ID ngẫu nhiên
 */
export const generateRandomString = (length = 6) => {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
};

/**
 * Tạo mã phiên game dựa trên thời gian (Chuẩn: YYYYMMDD + Index 1-based của phiên trong ngày)
 * Sử dụng UTC để đảm bảo tính nhất quán giữa các môi trường
 */
export const generatePeriod = (room, endTime) => {
  // Trừ đi 1ms để đảm bảo phiên kết thúc vào đúng 00:00:00 vẫn thuộc về ngày hôm trước
  const adjustedDate = new Date(endTime - 1);
  
  const year = adjustedDate.getUTCFullYear();
  const month = (adjustedDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = adjustedDate.getUTCDate().toString().padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Tính toán số giây từ đầu ngày UTC
  const startOfUTCDate = Date.UTC(year, adjustedDate.getUTCMonth(), adjustedDate.getUTCDate());
  const secondsSinceStartOfDay = Math.floor((endTime - startOfUTCDate) / 1000);
  
  const cycle = room.cycle_seconds || 60;
  
  // Index 1-based: Phiên đầu tiên kết thúc lúc 00:01:00 (với chu kỳ 60s) là index 1
  const index = Math.ceil(secondsSinceStartOfDay / cycle);
  const indexStr = index.toString().padStart(4, '0');
  
  return dateStr + indexStr;
};
