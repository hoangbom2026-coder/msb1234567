/**
 * i18n/index.ts
 *
 * Central i18n registry.
 * Lazily loads translations — only vi & en bundled by default,
 * others fetched on demand when user locale changes.
 */
// Type-only import — no static value import so vi/en can be lazy-loaded
import type { LocaleCode, TranslationKey } from './translations/vi';

export type { LocaleCode, TranslationKey };

// TranslationShape: widened (string values) version of TranslationKey.
// Needed because each locale file uses `as const` → literal types that differ
// across locales. We widen to `string` so all locales satisfy the same shape.
type DeepString<T> = { [K in keyof T]: T[K] extends object ? DeepString<T[K]> : string };
export type TranslationShape = DeepString<TranslationKey>;

// Cache for loaded translations (avoid re-importing on every call)
const cache = new Map<LocaleCode, TranslationShape>();

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
export async function loadTranslations(locale: LocaleCode): Promise<TranslationShape> {
  if (cache.has(locale)) return cache.get(locale)!;

  try {
    // All locales lazy-loaded — Vite will split each into its own chunk
    const mod = await import(`./translations/${locale}.ts`);
    const trans = (mod[locale] ?? mod.default) as TranslationShape;
    cache.set(locale, trans);
    return trans;
  } catch {
    // Locale file doesn't exist → fall back to English
    if (locale !== 'en') return loadTranslations('en');
    // Last resort: return empty-but-valid shape (no crash)
    return {} as TranslationShape;
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
