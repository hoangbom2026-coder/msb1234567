/**
 * lib/time-utils.ts
 *
 * Tiện ích format date/time theo timezone + locale của user.
 * Dùng Intl API (built-in, không cần thư viện ngoài).
 */

import type { LocaleCode } from '@/i18n/translations/vi';

// ─── Core formatters ──────────────────────────────────────────────────────────

/**
 * Format timestamp (ms hoặc Date) thành chuỗi date+time theo timezone của user.
 * @example formatDateTime(Date.now(), 'Asia/Ho_Chi_Minh', 'vi')
 * → "15/07/2025, 20:30:45"
 */
export function formatDateTime(
  value: number | Date,
  timezone = 'Asia/Ho_Chi_Minh',
  locale:   LocaleCode = 'vi',
): string {
  try {
    return new Intl.DateTimeFormat(toIntlLocale(locale), {
      timeZone:    timezone,
      year:        'numeric',
      month:       '2-digit',
      day:         '2-digit',
      hour:        '2-digit',
      minute:      '2-digit',
      second:      '2-digit',
      hour12:      false,
    }).format(typeof value === 'number' ? new Date(value) : value);
  } catch {
    return new Date(value).toLocaleString();
  }
}

/**
 * Format chỉ ngày (không có giờ).
 */
export function formatDate(
  value: number | Date,
  timezone = 'Asia/Ho_Chi_Minh',
  locale:   LocaleCode = 'vi',
): string {
  try {
    return new Intl.DateTimeFormat(toIntlLocale(locale), {
      timeZone: timezone,
      year:     'numeric',
      month:    '2-digit',
      day:      '2-digit',
    }).format(typeof value === 'number' ? new Date(value) : value);
  } catch {
    return new Date(value).toLocaleDateString();
  }
}

/**
 * Format chỉ giờ:phút:giây.
 */
export function formatTime(
  value: number | Date,
  timezone = 'Asia/Ho_Chi_Minh',
  locale:   LocaleCode = 'vi',
): string {
  try {
    return new Intl.DateTimeFormat(toIntlLocale(locale), {
      timeZone: timezone,
      hour:     '2-digit',
      minute:   '2-digit',
      second:   '2-digit',
      hour12:   false,
    }).format(typeof value === 'number' ? new Date(value) : value);
  } catch {
    return new Date(value).toLocaleTimeString();
  }
}

/**
 * Format số tiền theo currency + locale.
 * @example formatCurrency(1500000, 'USD', 'en') → "$1,500,000.00"
 */
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale:   LocaleCode = 'vi',
): string {
  try {
    return new Intl.NumberFormat(toIntlLocale(locale), {
      style:    'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

/**
 * Format số (không có currency).
 */
export function formatNumber(amount: number, locale: LocaleCode = 'vi'): string {
  try {
    return new Intl.NumberFormat(toIntlLocale(locale)).format(amount);
  } catch {
    return amount.toLocaleString();
  }
}

/**
 * Relative time: "5 phút trước", "2 giờ trước", "Hôm qua"
 */
export function formatRelativeTime(
  value: number | Date,
  locale: LocaleCode = 'vi',
): string {
  try {
    const ms   = typeof value === 'number' ? value : value.getTime();
    const diff = ms - Date.now(); // negative = past
    const abs  = Math.abs(diff);

    const rtf = new Intl.RelativeTimeFormat(toIntlLocale(locale), { numeric: 'auto' });

    if (abs < 60_000)    return rtf.format(Math.round(diff / 1000),     'second');
    if (abs < 3_600_000) return rtf.format(Math.round(diff / 60_000),   'minute');
    if (abs < 86_400_000)return rtf.format(Math.round(diff / 3_600_000),'hour');
    return                       rtf.format(Math.round(diff / 86_400_000),'day');
  } catch {
    return new Date(value).toLocaleString();
  }
}

/**
 * Trả về timezone offset hiện tại của user dưới dạng string "+07:00".
 */
export function getTimezoneOffset(timezone = 'Asia/Ho_Chi_Minh'): string {
  try {
    const parts = new Intl.DateTimeFormat('en', {
      timeZone:      timezone,
      timeZoneName:  'shortOffset',
    }).formatToParts(new Date());
    return parts.find(p => p.type === 'timeZoneName')?.value ?? 'UTC';
  } catch {
    return 'UTC';
  }
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Chuyển LocaleCode → BCP 47 locale tag cho Intl API.
 * Một số locale cần thêm script/region tag để Intl hiểu đúng.
 */
function toIntlLocale(locale: LocaleCode): string {
  const MAP: Partial<Record<LocaleCode, string>> = {
    vi: 'vi-VN',
    en: 'en-US',
    zh: 'zh-CN',
    th: 'th-TH',
    id: 'id-ID',
    ms: 'ms-MY',
    ja: 'ja-JP',
    ko: 'ko-KR',
    de: 'de-DE',
    fr: 'fr-FR',
    ru: 'ru-RU',
    ar: 'ar-SA',
  };
  return MAP[locale] ?? locale;
}
