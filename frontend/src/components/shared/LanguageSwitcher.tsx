/**
 * components/shared/LanguageSwitcher.tsx
 *
 * Dropdown để user tự chọn ngôn ngữ.
 * Đặt vào Header hoặc Account page.
 */

import React, { useState } from 'react';
import { useLocale } from '@/hooks/use-locale';
import { LOCALE_LABELS } from '@/i18n';
import type { LocaleCode } from '@/i18n/translations/vi';
import { cn } from '@/lib/utils';

// Chỉ show các ngôn ngữ phổ biến nhất trong dropdown
const SUPPORTED: LocaleCode[] = ['vi', 'en', 'zh', 'th', 'id', 'ms', 'ja', 'ko'];

const FLAG_EMOJI: Partial<Record<LocaleCode, string>> = {
  vi: '🇻🇳', en: '🇬🇧', zh: '🇨🇳', th: '🇹🇭',
  id: '🇮🇩', ms: '🇲🇾', ja: '🇯🇵', ko: '🇰🇷',
  de: '🇩🇪', fr: '🇫🇷', ru: '🇷🇺', ar: '🇸🇦',
};

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;   // true = chỉ show flag, false = flag + label
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className,
  compact = false,
}) => {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);

  const handleSelect = async (code: LocaleCode) => {
    await setLocale(code);
    setOpen(false);
  };

  return (
    <div className={cn('relative inline-block', className)} style={{ zIndex: 9999 }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium
                   bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Select language"
      >
        <span className="text-base leading-none">{FLAG_EMOJI[locale as LocaleCode] ?? '🌐'}</span>
        {!compact && (
          <span className="hidden sm:inline">{LOCALE_LABELS[locale as LocaleCode]}</span>
        )}
        <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-44 rounded-xl shadow-xl overflow-hidden
                          bg-[#132235] border border-white/10">
            {SUPPORTED.map(code => (
              <button
                key={code}
                onClick={() => handleSelect(code)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors',
                  'hover:bg-white/10',
                  locale === code ? 'bg-white/15 text-[#ffc53e] font-semibold' : 'text-white/80',
                )}
              >
                <span className="text-base leading-none">{FLAG_EMOJI[code] ?? '🌐'}</span>
                <span>{LOCALE_LABELS[code]}</span>
                {locale === code && (
                  <span className="ml-auto">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
