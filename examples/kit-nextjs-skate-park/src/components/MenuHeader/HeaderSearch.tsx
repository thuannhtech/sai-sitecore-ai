'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

export function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('sai-sitecore');

  const translate = (keys: string[], fallback: string) => {
    const key = keys.find((candidate) => t.has(candidate));
    return key ? t(key) : fallback;
  };

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim().replace(/\s+/g, '-');
    if (!value) return;
    router.push(`/${locale}/search?q=${encodeURIComponent(value)}`);
  }

  return (
    <>
      <button
        type="button"
        className="header-search-box"
        aria-expanded={isOpen}
        aria-controls="header-search-panel"
        onClick={() => setIsOpen((open) => !open)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span>{translate(['HEADER_SEARCH', 'HEADER_SEARCH_BUTTON', 'HEADER_SEARCH'], 'Search')}</span>
      </button>
      {isOpen && (
        <div className="header-search-panel" id="header-search-panel">
          <form className="header-search-form" onSubmit={submitSearch}>
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={translate(['HEADER_SEARCH_PLACEHOLDER', 'PLACEHOLDER_SEARCH'], 'Search here...')}
              aria-label={translate(['HEADER_SEARCH', 'HEADER_SEARCH_BUTTON', 'HEADER_SEARCH'], 'Search')}
            />
            <button type="submit">{translate(['HEADER_SEARCH_BUTTON', 'HEADER_SEARCH', 'HEADER_SEARCH'], 'Search')}</button>
          </form>
        </div>
      )}
    </>
  );
}
