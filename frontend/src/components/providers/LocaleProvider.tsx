/**
 * components/providers/LocaleProvider.tsx
 *
 * Provider wrapper — chạy IP detection 1 lần khi app khởi động.
 * Load translations vào store trước khi render children.
 * Hiển thị spinner nhỏ trong khi detect (< 2s).
 */

import React, { useEffect, useState } from 'react';
import { useLocaleStore } from '@/lib/locale-store';
import { loadTranslations } from '@/i18n';
import type { LocaleCode } from '@/i18n/translations/vi';

interface LocaleProviderProps {
  children: React.ReactNode;
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
  const { locale, isDetected, isOverridden, detectFromIP, translations } = useLocaleStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      // 1. Nếu đã có translations trong memory (hot-reload), dùng luôn
      if (Object.keys(translations).length > 0) {
        setReady(true);
        // Vẫn re-detect nếu chưa từng detect (lần đầu sau khi clear storage)
        if (!isDetected && !isOverridden) {
          detectFromIP();   // background, không block render
        }
        return;
      }

      // 2. Load translations cho locale đã persist (localStorage)
      const trans = await loadTranslations(locale as LocaleCode);
      useLocaleStore.setState({ translations: trans });

      // 3. IP detect nếu user chưa override
      if (!isOverridden) {
        await detectFromIP();
      }

      setReady(true);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Skeleton loader trong khi chờ (thường < 500ms với cache)
  if (!ready) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0c192c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 32, height: 32,
          border: '3px solid #1e3a5f',
          borderTopColor: '#ffc53e',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <>{children}</>;
};
