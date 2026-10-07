'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Search as SearchIcon } from 'lucide-react';
import { FilterEqual, usePreviewSearch, widget } from '@sitecore-search/react';
import type { PreviewSearchInitialState } from '@sitecore-search/react';
import { WidgetDataType } from '@sitecore-search/data';

const PREVIEW_SEARCH_RFK_ID = 'rfkid_6';
const PREVIEW_RESULT_LIMIT = 4;

type PreviewResult = {
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  summary?: string;
  image_url?: string | null;
  url?: string;
  product_url?: string;
  language?: string;
  type?: string;
};

type PreviewEntity = 'blogitem' | 'product';

type PreviewEntityWidgetProps = {
  rfkId: string;
  entity: PreviewEntity;
  locale: string;
  keyphrase: string;
  onResults: (entity: PreviewEntity, results: PreviewResult[], loading: boolean) => void;
};

function PreviewEntityWidget({ rfkId, entity, locale, keyphrase, onResults }: PreviewEntityWidgetProps) {
  const {
    actions: { onKeyphraseChange },
    query,
    queryResult,
    widgetRef,
  } = usePreviewSearch<PreviewResult, PreviewSearchInitialState<'itemsPerPage'>>({
    state: { itemsPerPage: PREVIEW_RESULT_LIMIT },
    query: (requestQuery) => {
      const request = requestQuery.getRequest();
      request.setSearchLimit(PREVIEW_RESULT_LIMIT);
      request.setSearchFilter(new FilterEqual('language', locale));
    },
  });

  // Separate debounce keys keep the blogitem and product requests independent
  // even though Sitecore Search assigns both entities to the same preview RFK ID.
  query.setDebounceBy(rfkId, `preview-${entity}`);

  useEffect(() => {
    onKeyphraseChange({ keyphrase });
  }, [keyphrase, onKeyphraseChange]);

  const results = queryResult.data?.content ?? [];
  const loading = queryResult.isLoading || queryResult.isFetching;
  useEffect(() => {
    onResults(entity, results, loading);
  }, [entity, loading, onResults, results]);

  return <div ref={widgetRef} data-rfkid={rfkId} data-entity={entity} hidden />;
}

const BlogPreviewWidget = widget(
  (props: Omit<PreviewEntityWidgetProps, 'entity'>) => <PreviewEntityWidget {...props} entity="blogitem" />,
  WidgetDataType.PREVIEW_SEARCH,
  'blogitem'
);

const ProductPreviewWidget = widget(
  (props: Omit<PreviewEntityWidgetProps, 'entity'>) => <PreviewEntityWidget {...props} entity="product" />,
  WidgetDataType.PREVIEW_SEARCH,
  'product'
);

export function SitecorePreviewSearch() {
  const locale = useLocale();
  const t = useTranslations('sai-sitecore');
  const [keyphrase, setKeyphrase] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [blogResults, setBlogResults] = useState<PreviewResult[]>([]);
  const [productResults, setProductResults] = useState<PreviewResult[]>([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);

  const handleResults = useMemo(
    () => (entity: PreviewEntity, results: PreviewResult[], loading: boolean) => {
      if (entity === 'blogitem') {
        setBlogResults(results);
        setBlogLoading(loading);
      } else {
        setProductResults(results);
        setProductLoading(loading);
      }
    },
    []
  );

  const allResults = [
    ...blogResults.map((item) => ({ ...item, resultType: 'blog' as const })),
    ...productResults.map((item) => ({ ...item, resultType: 'product' as const })),
  ];
  const loading = blogLoading || productLoading;
  const cleanKeyphrase = keyphrase.trim();
  const translation = (key: string, fallback: string) => {
    if (!t.has(key)) return fallback;
    const phrase = t(key);
    return phrase === key ? fallback : phrase;
  };

  const getResultUrl = (item: (typeof allResults)[number]) => {
    if (item.resultType === 'product') {
      return item.product_url || (item.name ? `/${locale}/products/${encodeURIComponent(item.name)}` : `/${locale}/products`);
    }
    return item.url || (item.name ? `/${locale}/blog/${encodeURIComponent(item.name)}` : `/${locale}/blog`);
  };

  const searchPageUrl = (value = keyphrase) => {
    const searchTerm = value.trim();
    if (!searchTerm) return;
    const params = new URLSearchParams({ q: searchTerm });
    window.location.assign(`/${locale}/search?${params.toString()}`);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    if (!cleanKeyphrase) {
      event.preventDefault();
      return;
    }
    setIsOpen(false);
  };

  return (
    <div className="sitecore-preview-search" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsOpen(false);
    }}>
      <button
        type="button"
        className="header-search-box"
        aria-expanded={isOpen}
        aria-controls="header-search-panel"
        onClick={() => setIsOpen((open) => !open)}
      >
        <SearchIcon size={20} aria-hidden="true" />
        <span>{translation('HEADER_SEARCH', 'Search')}</span>
      </button>

      <BlogPreviewWidget
        rfkId={PREVIEW_SEARCH_RFK_ID}
        locale={locale}
        keyphrase={keyphrase}
        onResults={handleResults}
      />
      <ProductPreviewWidget
        rfkId={PREVIEW_SEARCH_RFK_ID}
        locale={locale}
        keyphrase={keyphrase}
        onResults={handleResults}
      />

      {isOpen && (
        <div className="header-search-panel" id="header-search-panel">
          <div className="sitecore-preview-search-panel-content">
            <form
              className="header-search-form"
              action={`/${locale}/search`}
              method="get"
              onSubmit={submit}
              role="search"
            >
              <input type="hidden" name="q" value={cleanKeyphrase} />
              <input
                type="search"
                value={keyphrase}
                onChange={(event) => setKeyphrase(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    searchPageUrl(event.currentTarget.value);
                  }
                }}
                placeholder={translation('PLACEHOLDER_SEARCH', 'What are you looking for?')}
                aria-label={translation('HEADER_SEARCH', 'Search')}
                aria-expanded={cleanKeyphrase.length > 0}
                aria-controls="sitecore-preview-search-results"
                autoComplete="off"
                autoFocus
              />
              <button type="button" disabled={!cleanKeyphrase} onClick={() => searchPageUrl()}>
                {translation('HEADER_SEARCH', 'Search')}
              </button>
            </form>
          </div>
        {cleanKeyphrase.length > 0 && <div className="sitecore-preview-search-results" id="sitecore-preview-search-results" role="listbox">
          {loading ? <div className="sitecore-preview-search-status">Searching…</div> : null}
          {!loading && allResults.length === 0 ? (
            <div className="sitecore-preview-search-status">No results found.</div>
          ) : null}
          {allResults.map((item, index) => (
            <a
              className="sitecore-preview-search-result"
              href={getResultUrl(item)}
              key={`${item.resultType}-${item.id ?? item.name ?? index}`}
              role="option"
              aria-selected="false"
            >
              {item.image_url ? <img src={item.image_url} alt="" /> : null}
              <span className="sitecore-preview-search-result-copy">
                <small>{item.resultType === 'product' ? translation('RESULT_TYPE_PRODUCT', 'Product / Supply') : translation('RESULT_TYPE_BLOG', 'Blog')}</small>
                <strong>{item.title || item.name || translation('UNTITLED', 'Untitled')}</strong>
                {item.description || item.summary ? <span>{item.description || item.summary}</span> : null}
              </span>
            </a>
          ))}
          {!loading && allResults.length > 0 ? (
            <button className="sitecore-preview-search-all" type="button" onClick={() => searchPageUrl()}>
              View all results for “{cleanKeyphrase}”
            </button>
          ) : null}
        </div>}
        </div>
      )}
    </div>
  );
}
