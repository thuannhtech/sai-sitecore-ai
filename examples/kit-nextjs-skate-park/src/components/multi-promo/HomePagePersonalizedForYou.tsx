'use client';

import { useLocale } from 'next-intl';
import { FilterEqual, useRecommendation, widget } from '@sitecore-search/react';
import { WidgetDataType } from '@sitecore-search/data';

type ProductRecommendation = {
  id?: string;
  name?: string;
  description?: string;
  image_url?: string | null;
  product_url?: string;
  price?: number | string | null;
  language?: string;
  category_names?: string | string[];
};

const normalizeLanguage = (language: string) => language.trim().replace(/_/g, '-').toLowerCase();

function PersonalizedForYouResults({ rfkId }: { rfkId: string }) {
  const locale = useLocale();
  const { widgetRef, queryResult } = useRecommendation<
    ProductRecommendation,
    { itemsPerPage: number }
  >({
    // Fetch a few extra items in case Search returns mixed-language variants;
    // the final list is still strictly restricted to the active locale below.
    state: { itemsPerPage: 24 },
    query: (requestQuery) => {
      const request = requestQuery.getRequest();
      request.setSearchLimit(24);
      request.setSearchFilter(new FilterEqual('language', locale));
    },
  });

  const localeKey = normalizeLanguage(locale);
  const recommendations = (queryResult.data?.content ?? [])
    .filter((product) => product.language && normalizeLanguage(product.language) === localeKey)
    .slice(0, 4);
  const loading = queryResult.isLoading || queryResult.isFetching;
  const error = queryResult.isError;
  const isVietnamese = localeKey === 'vi-vn';

  return (
    <section
      ref={widgetRef}
      data-rfkid={rfkId}
      className="personalized-for-you mx-auto max-w-7xl px-6 py-12"
      aria-labelledby="personalized-for-you-title"
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            {isVietnamese ? 'Gợi ý cho bạn' : 'For you'}
          </p>
          <h2 id="personalized-for-you-title" className="text-2xl font-bold text-slate-900 md:text-3xl">
            {isVietnamese ? 'Dành riêng cho bạn' : 'Personalized For You'}
          </h2>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500" aria-live="polite">
          {isVietnamese ? 'Đang tải gợi ý…' : 'Loading recommendations…'}
        </p>
      ) : error ? (
        <p className="text-sm text-slate-500">
          {isVietnamese ? 'Hiện chưa thể tải gợi ý.' : 'Recommendations are temporarily unavailable.'}
        </p>
      ) : recommendations.length === 0 ? (
        <p className="text-sm text-slate-500">
          {isVietnamese
            ? `Chưa có sản phẩm gợi ý bằng ngôn ngữ ${locale}.`
            : 'No recommendations are available right now.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {recommendations.map((product, index) => {
            const href = product.product_url || (product.name
              ? `/${locale}/products/${encodeURIComponent(product.name)}`
              : `/${locale}/products`);
            const categoryLabels = Array.isArray(product.category_names)
              ? product.category_names.join(', ')
              : product.category_names;
            return (
              <a
                key={product.id ?? product.name ?? index}
                href={href}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-40 items-center justify-center overflow-hidden bg-slate-50 p-4">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name ?? ''} className="max-h-full max-w-full object-contain" loading="lazy" />
                  ) : (
                    <span className="text-sm text-slate-400">No image available</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="min-h-12 line-clamp-2 font-semibold leading-6 text-slate-900 group-hover:text-blue-700">
                    {product.name || 'Product'}
                  </h3>
                  {categoryLabels ? (
                    <p className="mt-2 line-clamp-1 text-sm text-slate-600">{categoryLabels}</p>
                  ) : null}
                  {product.description ? (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{product.description}</p>
                  ) : null}
                  {product.price !== undefined && product.price !== null && product.price !== '' ? (
                    <p className="mt-3 font-bold text-slate-900">${Number(product.price).toFixed(2)}</p>
                  ) : null}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}

export const HomePagePersonalizedForYou = widget(
  PersonalizedForYouResults,
  WidgetDataType.RECOMMENDATION,
  'product'
);
