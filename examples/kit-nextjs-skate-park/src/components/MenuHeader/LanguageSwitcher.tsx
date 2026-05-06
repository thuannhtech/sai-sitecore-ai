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
    <div className="language-switcher">
      <div className="language-switcher-wrapper">
        <select
          value={currentLocale}
          onChange={handleLanguageChange}
        >
          <option value="en">English</option>
          <option value="ja-JP">Japanese</option>
          <option value="vi-VN">Vietnamese</option>
          <option value="es-MX">Spanish (Mexico)</option>
          <option value="fr-FR">French</option>
          <option value="ko-KR">Korean</option>
        </select>
      </div>
    </div>
  );
};
