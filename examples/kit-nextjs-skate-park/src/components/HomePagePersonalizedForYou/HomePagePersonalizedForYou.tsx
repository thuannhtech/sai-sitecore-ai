'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { FilterEqual, useRecommendation, widget } from '@sitecore-search/react';
import { WidgetDataType } from '@sitecore-search/data';
import { normalizeSitecoreMediaUrl } from 'lib/sitecore-media-url';
import { getProductBrand } from 'src/lib/product-brand';
import config from 'src/lib/config';

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

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * KHỐI 1: TRENDING PRODUCTS XỬ LÝ BẰNG CODE
 * Lấy danh sách sản phẩm từ Sitecore Search, sắp xếp theo số lượt XEM và MUA
 * nhiều nhất (Trending Score), lọc chính xác theo ngôn ngữ (en / vi-VN).
 * ═══════════════════════════════════════════════════════════════════════════════
 */
function HomePageTrendingCode() {
  const locale = useLocale();
  const [products, setProducts] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const targetLang = locale.toLowerCase().startsWith('vi') ? 'vi-VN' : 'en';
  const isVietnamese = targetLang === 'vi-VN';

  useEffect(() => {
    let isMounted = true;

    async function fetchTrendingCode() {
      setLoading(true);
      try {
        const { env, customerKey, apiKey } = config.sitecoreSearch;
        const domainId = customerKey?.split('-').pop() || '179199281';
        const searchEnv = env || 'apse2';
        const endpoint = `https://discover-${searchEnv}.sitecorecloud.io/discover/v2/${domainId}`;
        const searchApiKey = apiKey || '01-77cd26d5-0419b3e820eaf66e26392140508a5bf7ef2c68bd';

        // Query Sitecore Search Recommendation API trực tiếp tại thời điểm khách truy cập
        // Ưu tiên widget rfkid_25 (clone từ CEC), fallback rfkid_1 nếu rfkid_25 chưa bấm Publish trên CEC
        async function queryWidget(id: string) {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              Authorization: searchApiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              context: { locale: { language: 'en', country: 'us' } },
              widget: {
                items: [
                  {
                    rfk_id: id,
                    entity: 'product',
                    recommendations: { content: {}, limit: 12 },
                    search: {
                      limit: 12,
                      filter: { type: 'eq', name: 'language', value: targetLang },
                    },
                  },
                ],
              },
            }),
          });
          const json = await res.json();
          return (json.widgets?.[0]?.content || []) as ProductRecommendation[];
        }

        let rawItems = await queryWidget('rfkid_25');
        if (!rawItems.length) {
          rawItems = await queryWidget('rfkid_1');
        }

        // Lọc chính xác theo Language (en / vi-VN)
        // Thứ tự xếp hạng hoàn toàn do AI Recommendation Recipe của Sitecore Search
        // tính toán thời gian thực tại thời điểm khách vào, KHÔNG dùng mảng hard-code!
        const filtered = rawItems.filter((item) => item.language === targetLang);

        if (isMounted) {
          setProducts(filtered.slice(0, 4));
        }
      } catch (err) {
        console.error('[TrendingCode] Error querying Sitecore Search:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchTrendingCode();

    return () => {
      isMounted = false;
    };
  }, [locale, targetLang]);

  return (
    <section className="homepage-trending-code mx-auto max-w-7xl px-6 pt-10 pb-6" aria-labelledby="trending-code-title">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              Cách 1: Xử lý bằng Code
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
              Lang: {targetLang}
            </span>
          </div>
          <h2 id="trending-code-title" className="text-2xl font-black text-slate-900 md:text-3xl tracking-tight">
            Trending Products <span className="text-emerald-600">(By Code — Real-time Sitecore Search)</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isVietnamese
              ? `Xếp hạng sản phẩm thịnh hành trực tiếp từ Sitecore Search API tại thời điểm truy cập, lọc theo ${targetLang}`
              : `Real-time popularity ranking directly queried from Sitecore Search API, filtered by ${targetLang}`}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4">
              <div className="h-40 bg-slate-100 rounded-xl mb-4" />
              <div className="h-4 bg-slate-100 rounded w-1/3 mb-2" />
              <div className="h-5 bg-slate-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-sm text-slate-500">
          {isVietnamese ? `Chưa có sản phẩm thịnh hành bằng ngôn ngữ ${targetLang}.` : 'No trending products available right now.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => {
            const href = product.product_url || (product.name
              ? `/${locale}/products/${encodeURIComponent(product.name)}`
              : `/${locale}/products`);
            const itemBrand = getProductBrand(product);
            const isIntel = itemBrand.toUpperCase() === 'INTEL';
            const categoryLabels = Array.isArray(product.category_names)
              ? product.category_names.join(', ')
              : product.category_names;

            return (
              <a
                key={product.id ?? product.name ?? index}
                href={href}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="relative flex h-40 items-center justify-center bg-slate-50 p-4">
                    {/* Rank Badge từ Sitecore Search */}
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-[10px] font-black text-white shadow-sm backdrop-blur-sm">
                        🔥 Top #{index + 1} Trending
                      </span>
                    </div>

                    {product.image_url ? (
                      <img
                        src={normalizeSitecoreMediaUrl(product.image_url)}
                        alt={product.name ?? ''}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">No image available</span>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="mb-2 flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          isIntel
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-orange-50 text-orange-700 border border-orange-200'
                        }`}
                      >
                        Brand: {itemBrand}
                      </span>
                      {categoryLabels ? (
                        <span className="line-clamp-1 text-xs text-slate-400 font-medium">
                          • {categoryLabels}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                      {product.name || 'Product'}
                    </h3>
                    {product.description ? (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{product.description}</p>
                    ) : null}
                  </div>
                </div>

                <div className="p-4 pt-0">
                  {product.price !== undefined && product.price !== null && product.price !== '' ? (
                    <p className="font-bold text-slate-900">${Number(product.price).toFixed(2)}</p>
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

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * KHỐI 2: TRENDING PRODUCTS XỬ LÝ BẰNG WIDGET (rfkid_25)
 * Dùng hook useRecommendation kết nối với Widget rfkid_25 OOTB trên CEC
 * ═══════════════════════════════════════════════════════════════════════════════
 */
function PersonalizedForYouResults({ rfkId = 'rfkid_25' }: { rfkId: string }) {
  const locale = useLocale();
  const targetLang = locale.toLowerCase().startsWith('vi') ? 'vi-VN' : 'en';
  const isVietnamese = targetLang === 'vi-VN';

  const { widgetRef, queryResult } = useRecommendation<
    ProductRecommendation,
    { itemsPerPage: number }
  >({
    state: { itemsPerPage: 24 },
    query: (requestQuery) => {
      const request = requestQuery.getRequest();
      request.setSearchLimit(24);
      request.setSearchFilter(new FilterEqual('language', targetLang));
    },
  });

  const recommendations = (queryResult.data?.content ?? [])
    .filter((product) => product.language === targetLang)
    .slice(0, 4);

  const loading = queryResult.isLoading || queryResult.isFetching;
  const error = queryResult.isError;

  return (
    <section
      ref={widgetRef}
      data-rfkid={rfkId}
      className="personalized-for-you mx-auto max-w-7xl px-6 pt-6 pb-12"
      aria-labelledby="personalized-for-you-title"
    >
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300">
              Cách 2: Xử lý bằng Widget (rfkid_25)
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
              OOTB Top Viewed Recipe
            </span>
          </div>
          <h2 id="personalized-for-you-title" className="text-2xl font-black text-slate-900 md:text-3xl tracking-tight">
            Trending Products <span className="text-purple-600">(Sitecore Search Widget rfkid_25)</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isVietnamese
              ? 'Sản phẩm thịnh hành trực tiếp từ Sitecore Search Recommendation Recipe (Top Viewed Products)'
              : 'Direct recommendations served by Sitecore Search Recommendation Widget (rfkid_25) configured on CEC'}
          </p>
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
            ? `Chưa có sản phẩm gợi ý bằng ngôn ngữ ${targetLang}.`
            : 'No recommendations are available right now.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {recommendations.map((product, index) => {
            const href = product.product_url || (product.name
              ? `/${locale}/products/${encodeURIComponent(product.name)}`
              : `/${locale}/products`);
            const itemBrand = getProductBrand(product);
            const isIntel = itemBrand.toUpperCase() === 'INTEL';
            const categoryLabels = Array.isArray(product.category_names)
              ? product.category_names.join(', ')
              : product.category_names;

            return (
              <a
                key={product.id ?? product.name ?? index}
                href={href}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-40 items-center justify-center overflow-hidden bg-slate-50 p-4">
                    {product.image_url ? (
                      <img src={normalizeSitecoreMediaUrl(product.image_url)} alt={product.name ?? ''} className="max-h-full max-w-full object-contain" loading="lazy" />
                    ) : (
                      <span className="text-sm text-slate-400">No image available</span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mb-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          isIntel
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-orange-50 text-orange-700 border border-orange-200'
                        }`}
                      >
                        Brand: {itemBrand}
                      </span>
                    </div>
                    <h3 className="min-h-12 line-clamp-2 font-semibold leading-6 text-slate-900 group-hover:text-purple-600 transition-colors">
                      {product.name || 'Product'}
                    </h3>
                    {categoryLabels ? (
                      <p className="mt-2 line-clamp-1 text-sm text-slate-600">{categoryLabels}</p>
                    ) : null}
                    {product.description ? (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{product.description}</p>
                    ) : null}
                  </div>
                </div>

                <div className="p-4 pt-0">
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

const PersonalizedForYouWidget = widget(
  PersonalizedForYouResults,
  WidgetDataType.RECOMMENDATION,
  'product'
);

/**
 * Component chính hiển thị đồng thời cả 2 cục Trending Products (Code & Widget)
 */
export function HomePagePersonalizedForYou({ rfkId = 'rfkid_25' }: { rfkId?: string }) {
  return (
    <div className="w-full bg-slate-50/40 border-t border-slate-200">
      {/* 1. Cục Trending Products xử lý bằng Code (Xem và Mua nhiều nhất, lọc theo Lang) */}
      {/* <HomePageTrendingCode /> */}

      {/* 2. Cục Trending Products xài Widget rfkid_25 OOTB */}
      <PersonalizedForYouWidget rfkId={rfkId} />
    </div>
  );
}

export default HomePagePersonalizedForYou;
