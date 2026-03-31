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

  // In Editor mode, get locale from search params first
  const currentLocale = searchParams.get('language') || searchParams.get('sc_lang') || locale;

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;

    // Check if we are in Sitecore Editing Mode (Experience Editor / Pages)
    const isEditing = searchParams.get('sc_mode') === 'edit' || searchParams.get('mode') === 'edit';

    if (isEditing) {
      // In Editor mode, we want to stay on the same page but update the language parameter
      // This is exactly how Sitecore Pages handles language switching internally
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('language', newLocale);
      newParams.set('sc_lang', newLocale);

      // Perform a hard refresh with new query params to ensure Sitecore context is updated
      window.location.search = newParams.toString();
      return;
    }

    // Outside of Editor mode (Rendering), use standard path-based localization
    const searchString = searchParams.toString();
    const query = searchString ? `?${searchString}` : '';
    router.replace(`${pathname}${query}`, { locale: newLocale });
  };

  return (
    <div className="language-switcher" style={{ display: 'flex', alignItems: 'center', marginLeft: '12px' }}>
      <div style={{ position: 'relative' }}>
        <select
          value={currentLocale}
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
