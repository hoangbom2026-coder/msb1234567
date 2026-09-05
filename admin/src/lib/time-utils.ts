/**
 * lib/time-utils.ts (admin)
 *
 * Re-export từ frontend time-utils pattern.
 * Admin dùng timezone detect từ IP giống frontend.
 */

import type { LocaleCode } from '@/i18n/translations/vi';

export function formatDateTime(
  value: number | Date,
  timezone = 'UTC',
  locale: LocaleCode = 'en',
): string {
  try {
    return new Intl.DateTimeFormat(toIntlLocale(locale), {
      timeZone: timezone,
      year:     'numeric', month:  '2-digit', day:    '2-digit',
      hour:     '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).format(typeof value === 'number' ? new Date(value) : value);
  } catch {
    return new Date(value).toLocaleString();
  }
}

export function formatDate(value: number | Date, timezone = 'UTC', locale: LocaleCode = 'en'): string {
  try {
    return new Intl.DateTimeFormat(toIntlLocale(locale), {
      timeZone: timezone,
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(typeof value === 'number' ? new Date(value) : value);
  } catch {
    return new Date(value).toLocaleDateString();
  }
}

export function formatTime(value: number | Date, timezone = 'UTC', locale: LocaleCode = 'en'): string {
  try {
    return new Intl.DateTimeFormat(toIntlLocale(locale), {
      timeZone: timezone,
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).format(typeof value === 'number' ? new Date(value) : value);
  } catch {
    return new Date(value).toLocaleTimeString();
  }
}

export function formatCurrency(amount: number, currency = 'USD', locale: LocaleCode = 'en'): string {
  try {
    return new Intl.NumberFormat(toIntlLocale(locale), {
      style: 'currency', currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatNumber(amount: number, locale: LocaleCode = 'en'): string {
  return new Intl.NumberFormat(toIntlLocale(locale)).format(amount);
}

function toIntlLocale(locale: LocaleCode): string {
  const MAP: Partial<Record<LocaleCode, string>> = {
    vi: 'vi-VN', en: 'en-US', zh: 'zh-CN', th: 'th-TH',
    id: 'id-ID', ms: 'ms-MY', ja: 'ja-JP', ko: 'ko-KR',
    de: 'de-DE', fr: 'fr-FR', ru: 'ru-RU', ar: 'ar-SA',
  };
  return MAP[locale] ?? locale;
}
