/**
 * lib/locale-store.ts
 *
 * Zustand store cho locale + timezone.
 * Persist vào localStorage để user không bị reset khi reload.
 * Hỗ trợ:
 *   - Auto-detect từ /api/config/locale (IP-based)
 *   - Override thủ công bởi user (language switcher)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LocaleCode } from '@/i18n/translations/vi';
import { loadTranslations, isRTL, getNestedValue } from '@/i18n';
import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocaleState {
  locale:     LocaleCode;
  timezone:   string;
  country:    string;
  currency:   string;
  dateFormat: string;
  isRTL:      boolean;
  isDetected: boolean;          // true sau khi đã detect xong từ IP
  isOverridden: boolean;        // true khi user tự chọn ngôn ngữ
  translations: Record<string, any>;

  // Actions
  setLocale:    (locale: LocaleCode) => Promise<void>;
  detectFromIP: () => Promise<void>;
  t:            (key: string, fallback?: string) => string;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale:       'vi',
      timezone:     'Asia/Ho_Chi_Minh',
      country:      'VN',
      currency:     'USD',
      dateFormat:   'DD/MM/YYYY',
      isRTL:        false,
      isDetected:   false,
      isOverridden: false,
      translations: {},

      /**
       * Đặt locale thủ công (user override).
       * Đánh dấu isOverridden = true để không bị ghi đè bởi IP detect.
       */
      setLocale: async (locale: LocaleCode) => {
        const translations = await loadTranslations(locale);
        set({
          locale,
          isRTL: isRTL(locale),
          isOverridden: true,
          translations,
        });
        // Cập nhật html lang + dir
        applyHtmlAttrs(locale);
      },

      /**
       * Detect locale từ IP qua backend API.
       * Chỉ chạy nếu user chưa override thủ công.
       */
      detectFromIP: async () => {
        if (get().isOverridden) return;   // user đã chọn tay → không override

        try {
          const res = await api.get('/config/locale');
          if (!res.data?.status) return;

          const { locale, timezone, country, currency, dateFormat } = res.data.data as {
            locale: LocaleCode;
            timezone: string;
            country: string;
            currency: string;
            dateFormat: string;
          };

          const translations = await loadTranslations(locale);

          set({
            locale,
            timezone,
            country,
            currency,
            dateFormat,
            isRTL: isRTL(locale),
            isDetected: true,
            translations,
          });

          applyHtmlAttrs(locale);
        } catch {
          // API lỗi → giữ nguyên mặc định vi, không crash
          const translations = await loadTranslations(get().locale);
          set({ isDetected: true, translations });
          applyHtmlAttrs(get().locale);
        }
      },

      /**
       * Hàm dịch với dot-notation key.
       * t('game.betPlaced') hoặc t('auth.login')
       */
      t: (key: string, fallback?: string) => {
        const val = getNestedValue(get().translations, key);
        if (val === key) return fallback ?? key;
        return val;
      },
    }),
    {
      name: 'locale-storage',
      storage: createJSONStorage(() => localStorage),
      // Chỉ persist các giá trị ổn định, KHÔNG persist translations (object lớn)
      partialize: (state) => ({
        locale:       state.locale,
        timezone:     state.timezone,
        country:      state.country,
        currency:     state.currency,
        dateFormat:   state.dateFormat,
        isRTL:        state.isRTL,
        isOverridden: state.isOverridden,
      }),
    }
  )
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Cập nhật <html lang="..." dir="..."> cho accessibility + SEO.
 */
function applyHtmlAttrs(locale: LocaleCode) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = locale;
  document.documentElement.dir  = isRTL(locale) ? 'rtl' : 'ltr';
}
