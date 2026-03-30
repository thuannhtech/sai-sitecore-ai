'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'src/i18n/navigation';
import { useSearchParams } from 'next/navigation';

export const LanguageSwitcher: React.FC = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;

    // Convert current searchParams to a string
    const searchString = searchParams.toString();
    const query = searchString ? `?${searchString}` : '';

    // Change language and preserve the path and query string
    // Note: pathname from src/i18n/navigation is already locale-less
    router.replace(`${pathname}${query}`, { locale: newLocale });
  };

  return (
    <div className="language-switcher" style={{ display: 'flex', alignItems: 'center', marginLeft: '12px' }}>
      <div style={{ position: 'relative' }}>
        <select
          value={locale}
          onChange={handleLanguageChange}
          style={{
            appearance: 'none',
            padding: '6px 36px 6px 14px',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: '600',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            color: '#ffffff',
            outline: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
            backgroundSize: '14px',
            transition: 'all 0.2s ease-in-out',
            minWidth: '130px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)')}
        >
          <option value="en" style={{ backgroundColor: '#0022a1', color: '#fff' }}>English</option>
          <option value="ja-JP" style={{ backgroundColor: '#0022a1', color: '#fff' }}>Japanese</option>
          <option value="vi-VN" style={{ backgroundColor: '#0022a1', color: '#fff' }}>Vietnamese</option>
        </select>
      </div>
    </div>
  );
};
