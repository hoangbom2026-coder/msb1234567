/**
 * i18n/index.ts
 *
 * Central i18n registry.
 * Lazily loads translations — only vi & en bundled by default,
 * others fetched on demand when user locale changes.
 */
import { vi } from './translations/vi';
import { en } from './translations/en';
import type { LocaleCode } from './translations/vi';

export type { LocaleCode };

// All built-in translations (bundle these — they're the primary markets)
const BUILT_IN: Partial<Record<LocaleCode, typeof vi>> = { vi, en };

// Locale → human-readable label for language switcher
export const LOCALE_LABELS: Record<LocaleCode, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
  zh: '中文',
  th: 'ภาษาไทย',
  id: 'Bahasa Indonesia',
  ms: 'Bahasa Melayu',
  ja: '日本語',
  ko: '한국어',
  de: 'Deutsch',
  fr: 'Français',
  ru: 'Русский',
  ar: 'العربية',
};

// Locales that read right-to-left
export const RTL_LOCALES: LocaleCode[] = ['ar'];

export const isRTL = (locale: LocaleCode) => RTL_LOCALES.includes(locale);

/**
 * Load translations for a given locale.
 * Falls back to English if the locale is not available.
 */
export async function loadTranslations(locale: LocaleCode): Promise<typeof vi> {
  if (BUILT_IN[locale]) return BUILT_IN[locale]!;

  // Dynamic imports for non-bundled locales (lazy loaded)
  try {
    const mod = await import(`./translations/${locale}.ts`);
    return mod[locale] ?? en;
  } catch {
    // Locale file doesn't exist yet → fall back to English
    return en;
  }
}

/**
 * Deep-get a nested key from translations with dot-notation.
 * e.g. t('game.betPlaced') → "Đặt cược thành công"
 */
export function getNestedValue(obj: Record<string, any>, path: string): string {
  const keys = path.split('.');
  let current: any = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return path;
    current = current[key];
  }
  return typeof current === 'string' ? current : path;
}
