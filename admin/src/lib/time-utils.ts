

const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';

export function formatDateTime(
  date: Date | number | string, 
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false,
  }
): string {
  if (!date) return '---';
  try {
    const d = new Date(Number(date) || date);
    if (isNaN(d.getTime())) return '---';
    
    return new Intl.DateTimeFormat('vi-VN', {
      ...options,
      timeZone: DEFAULT_TIMEZONE,
    }).format(d);
  } catch (e) {
    console.error('Error formatting date:', e);
    return '---';
  }
}

export function formatTime(date: Date | number | string): string {
  return formatDateTime(date, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatDate(date: Date | number | string): string {
  return formatDateTime(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getRelativeTime(date: Date | number | string): string {
  if (!date) return '---';
  const d = new Date(Number(date) || date);
  if (isNaN(d.getTime())) return '---';

  const diff = Date.now() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 30) return 'Vừa xong';
  if (seconds < 60) return `${seconds} giây trước`;
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  
  return formatDate(date);
}
