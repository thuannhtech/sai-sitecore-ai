'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Search as SearchIcon } from 'lucide-react';
import {
  FilterEqual,
  usePreviewSearch,
  widget,
  trackPreviewSearchClickEvent,
  trackViewEvent,
} from '@sitecore-search/react';
import type { PreviewSearchInitialState } from '@sitecore-search/react';
import { WidgetDataType } from '@sitecore-search/data';
import { normalizeSitecoreMediaUrl } from 'lib/sitecore-media-url';
import sitecoreConfig from 'sitecore.config';

const PREVIEW_SEARCH_RFK_ID = 'rfkid_65';
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
  source_id?: string;
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

  const content = queryResult.data?.content;
  const loading = queryResult.isLoading || queryResult.isFetching;
  useEffect(() => {
    onResults(entity, content ?? [], loading);
  }, [entity, loading, onResults, content]);

  return null;
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
  const t = useTranslations(sitecoreConfig.defaultSite || undefined);
  const [keyphrase, setKeyphrase] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [blogResults, setBlogResults] = useState<PreviewResult[]>([]);
  const [productResults, setProductResults] = useState<PreviewResult[]>([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const lastTrackedViewKeyRef = useRef<string>('');

  const handleResults = useMemo(
    () => (entity: PreviewEntity, results: PreviewResult[], loading: boolean) => {
      if (entity === 'blogitem') {
        setBlogLoading((prev) => (prev !== loading ? loading : prev));
        setBlogResults((prev) => {
          if (prev.length === 0 && results.length === 0) return prev;
          if (prev === results) return prev;
          return results;
        });
      } else {
        setProductLoading((prev) => (prev !== loading ? loading : prev));
        setProductResults((prev) => {
          if (prev.length === 0 && results.length === 0) return prev;
          if (prev === results) return prev;
          return results;
        });
      }
    },
    []
  );

  const allResults = [
    ...blogResults.map((item, index) => ({ ...item, resultType: 'blog' as const, entityIndex: index })),
    ...productResults.map((item, index) => ({ ...item, resultType: 'product' as const, entityIndex: index })),
  ];
  const loading = blogLoading || productLoading;
  const cleanKeyphrase = keyphrase.trim();

  // Track Widget Views whenever search results are displayed in the dropdown
  useEffect(() => {
    if (!isOpen || !cleanKeyphrase || loading) return;

    const currentKey = `${cleanKeyphrase}_${productResults.map((p) => p.id).join(',')}_${blogResults.map((b) => b.id).join(',')}`;
    if (lastTrackedViewKeyRef.current === currentKey) return;
    lastTrackedViewKeyRef.current = currentKey;

    const validProducts = productResults.filter((p) => Boolean(p.id));
    if (validProducts.length > 0) {
      void trackViewEvent(PREVIEW_SEARCH_RFK_ID, 'product', {
        request: {
          keyword: cleanKeyphrase,
          num_results: validProducts.length,
        },
        items: validProducts.map((p) => ({
          id: p.id!,
          sourceId: p.source_id,
        })),
      }).catch((err) => {
        console.warn('[Sitecore Search] Product preview view tracking failed:', err);
      });
    }

    const validBlogs = blogResults.filter((b) => Boolean(b.id));
    if (validBlogs.length > 0) {
      void trackViewEvent(PREVIEW_SEARCH_RFK_ID, 'blogitem', {
        request: {
          keyword: cleanKeyphrase,
          num_results: validBlogs.length,
        },
        items: validBlogs.map((b) => ({
          id: b.id!,
          sourceId: b.source_id,
        })),
      }).catch((err) => {
        console.warn('[Sitecore Search] Blog preview view tracking failed:', err);
      });
    }
  }, [isOpen, cleanKeyphrase, loading, productResults, blogResults]);

  // Reset view deduplication key when the dropdown is closed or input is cleared
  useEffect(() => {
    if (!isOpen || !cleanKeyphrase) {
      lastTrackedViewKeyRef.current = '';
    }
  }, [isOpen, cleanKeyphrase]);

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

  const handleResultClick = async (
    event: React.MouseEvent<HTMLAnchorElement>,
    item: (typeof allResults)[number]
  ) => {
    const targetUrl = getResultUrl(item);

    // If opening in a new tab/window via middle click or modifier keys, let the browser handle navigation naturally
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      if (item.id) {
        const entity: PreviewEntity = item.resultType === 'product' ? 'product' : 'blogitem';
        const entityCount = item.resultType === 'product' ? productResults.length : blogResults.length;
        void trackPreviewSearchClickEvent(PREVIEW_SEARCH_RFK_ID, entity, {
          index: item.entityIndex,
          items: [{ id: item.id, sourceId: item.source_id }],
          keyword: cleanKeyphrase,
          numResults: entityCount,
        }).catch((err) => {
          console.warn('[Sitecore Search] Preview click tracking error:', err);
        });
      }
      return;
    }

    // Standard navigation on same page: prevent default to avoid browser aborting the in-flight tracking fetch
    event.preventDefault();

    if (item.id) {
      const entity: PreviewEntity = item.resultType === 'product' ? 'product' : 'blogitem';
      const entityCount = item.resultType === 'product' ? productResults.length : blogResults.length;
      try {
        await Promise.race([
          trackPreviewSearchClickEvent(PREVIEW_SEARCH_RFK_ID, entity, {
            index: item.entityIndex,
            items: [{ id: item.id, sourceId: item.source_id }],
            keyword: cleanKeyphrase,
            numResults: entityCount,
          }),
          new Promise((resolve) => setTimeout(resolve, 250)),
        ]);
      } catch (err) {
        console.warn('[Sitecore Search] Preview click tracking error:', err);
      }
    }

    window.location.assign(targetUrl);
  };

  return (
    <div
      className="sitecore-preview-search"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsOpen(false);
      }}
    >
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
          {cleanKeyphrase.length > 0 && (
            <div className="sitecore-preview-search-results" id="sitecore-preview-search-results" role="listbox">
              {loading ? <div className="sitecore-preview-search-status">Searching…</div> : null}
              {!loading && allResults.length === 0 ? (
                <div className="sitecore-preview-search-status">No results found.</div>
              ) : null}
              {allResults.map((item, index) => (
                <a
                  className="sitecore-preview-search-result"
                  href={getResultUrl(item)}
                  onClick={(e) => void handleResultClick(e, item)}
                  key={`${item.resultType}-${item.id ?? item.name ?? index}`}
                  role="option"
                  aria-selected="false"
                >
                  {item.image_url ? <img src={normalizeSitecoreMediaUrl(item.image_url)} alt="" /> : null}
                  <span className="sitecore-preview-search-result-copy">
                    <small>
                      {item.resultType === 'product'
                        ? translation('RESULT_TYPE_PRODUCT', 'Product / Supply')
                        : translation('RESULT_TYPE_BLOG', 'Blog')}
                    </small>
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
