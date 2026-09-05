/**
 * hooks/use-locale.ts
 *
 * Convenience hook — expose toàn bộ locale state + helpers.
 * Dùng ở bất kỳ component nào cần dịch text hoặc format ngày giờ.
 *
 * @example
 * const { t, formatDateTime, locale, timezone } = useLocale();
 * <p>{t('game.betPlaced')}</p>
 * <span>{formatDateTime(bet.created_at)}</span>
 */

import { useLocaleStore } from '@/lib/locale-store';
import {
  formatDateTime as _fdt,
  formatDate     as _fd,
  formatTime     as _ft,
  formatCurrency as _fc,
  formatNumber   as _fn,
  formatRelativeTime as _frt,
  getTimezoneOffset,
} from '@/lib/time-utils';
import type { LocaleCode } from '@/i18n/translations/vi';

export const useLocale = () => {
  const {
    locale, timezone, country, currency,
    dateFormat, isRTL, isDetected,
    setLocale, t,
  } = useLocaleStore();

  return {
    // ── State ──────────────────────────────────────────────────────────────
    locale,
    timezone,
    country,
    currency,
    dateFormat,
    isRTL,
    isDetected,

    // ── Actions ────────────────────────────────────────────────────────────
    setLocale,
    t,

    // ── Formatters bound to current locale+timezone ───────────────────────
    formatDateTime:   (v: number | Date) => _fdt(v, timezone, locale as LocaleCode),
    formatDate:       (v: number | Date) => _fd(v,  timezone, locale as LocaleCode),
    formatTime:       (v: number | Date) => _ft(v,  timezone, locale as LocaleCode),
    formatCurrency:   (v: number)        => _fc(v,  currency, locale as LocaleCode),
    formatNumber:     (v: number)        => _fn(v,  locale as LocaleCode),
    formatRelativeTime:(v: number | Date)=> _frt(v, locale as LocaleCode),
    timezoneOffset:   () => getTimezoneOffset(timezone),
  };
};
