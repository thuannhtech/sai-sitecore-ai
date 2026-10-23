'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Eye } from 'lucide-react';
import { useLocale } from 'next-intl';
import { FilterEqual, PageController, useRecommendation, widget, trackRecommendationClickEntityEvent, trackSearchResultsClickEntityEvent } from '@sitecore-search/react';
import { WidgetDataType } from '@sitecore-search/data';
import { normalizeSitecoreMediaUrl } from 'src/lib/sitecore-media-url';
import { getProductBrand } from 'src/lib/product-brand';
import { getProductViewCount, recordProductView } from 'src/lib/product-views';
import config from 'src/lib/config';

export type RelatedProduct = {
  id?: string;
  name?: string;
  description?: string;
  image_url?: string | null;
  product_url?: string;
  price?: number | string | null;
  language?: string;
  brand?: string;
  category_names?: string | string[];
};

export type ProductMoreLikeThisProps = {
  productId: string;
  productName?: string;
  brand?: string;
  rfkId?: string;
};

const normalizeLanguage = (language = '') => language.trim().replace(/_/g, '-').toLowerCase();

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CÁCH 1: XỬ LÝ BẰNG CODE (CUSTOM SITECORE SEARCH QUERY)
 * 1. Lấy tất cả product cùng Brand bằng Sitecore Search
 * 2. Sắp xếp thứ tự giảm dần theo số lượng Views
 * 3. Không lấy sản phẩm đang xem PDP
 * 4. Lấy theo language chuẩn
 * ═══════════════════════════════════════════════════════════════════════════════
 */
function ProductMoreLikeThisCode({
  productId,
  productName,
  brand,
}: ProductMoreLikeThisProps) {
  const locale = useLocale();
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const cleanId = (productId || '').replace(/[{}-]/g, '').toUpperCase();
  const localeKey = normalizeLanguage(locale);
  const targetBrand = (
    brand ||
    ((productName || productId || '').toLowerCase().includes('intel') ||
    (productName || productId || '').toLowerCase().includes('poc-101') ||
    (productName || productId || '').toLowerCase().includes('poc-103')
      ? 'Intel'
      : 'AMD')
  ).trim();

  useEffect(() => {
    let isMounted = true;

    // Ghi nhận lượt xem cho sản phẩm hiện tại vào Local Tracker
    if (productId || productName) {
      recordProductView(productId, productName);
    }

    async function fetchMoreLikeThis() {
      setLoading(true);
      try {
        const { env, customerKey, apiKey } = config.sitecoreSearch;
        const domainId = customerKey?.split('-').pop() || '179199281';
        const searchEnv = env || 'apse2';
        const endpoint = `https://discover-${searchEnv}.sitecorecloud.io/discover/v2/${domainId}`;
        const searchApiKey = apiKey || '01-77cd26d5-0419b3e820eaf66e26392140508a5bf7ef2c68bd';

        // Quy đổi chính xác ngôn ngữ: Trang tiếng Anh là 'en', trang tiếng Việt là 'vi-VN'
        const targetLang = locale.toLowerCase().startsWith('vi') ? 'vi-VN' : 'en';

        // 1. Query Sitecore Search theo Brand và Language
        // Lưu ý: context.locale giữ 'en'/'us' do search domain chỉ hỗ trợ context en,
        // còn việc lọc ngôn ngữ dữ liệu được chỉ định chính xác qua search.filter: language = targetLang.
        const payload = {
          context: {
            locale: { language: 'en', country: 'us' },
          },
          widget: {
            items: [
              {
                rfk_id: 'rfkid_7',
                entity: 'product',
                search: {
                  content: {},
                  limit: 30,
                  filter: {
                    type: 'and',
                    filters: [
                      { type: 'eq', name: 'language', value: targetLang },
                      { type: 'eq', name: 'category_names', value: targetBrand },
                    ],
                  },
                },
              },
            ],
          },
        };

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: searchApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        let items: RelatedProduct[] = json.widgets?.[0]?.content || [];

        // Fallback: Nếu query category_names chưa có kết quả, lấy theo language rồi lọc theo Brand trong code
        if (!items.length) {
          const fallbackPayload = {
            context: { locale: { language: 'en', country: 'us' } },
            widget: {
              items: [
                {
                  rfk_id: 'rfkid_7',
                  entity: 'product',
                  search: {
                    content: {},
                    limit: 40,
                    filter: { type: 'eq', name: 'language', value: targetLang },
                  },
                },
              ],
            },
          };
          const fallbackRes = await fetch(endpoint, {
            method: 'POST',
            headers: {
              Authorization: searchApiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(fallbackPayload),
          });
          const fallbackJson = await fallbackRes.json();
          items = fallbackJson.widgets?.[0]?.content || [];
        }

        // Lọc đáp ứng các tiêu chí:
        const filtered = items.filter((item) => {
          // 3. Loại trừ sản phẩm đang xem trên PDP
          if (item.id && (item.id === productId || (cleanId && item.id.toUpperCase().includes(cleanId)))) {
            return false;
          }
          if (
            item.name &&
            productName &&
            item.name.trim().toLowerCase() === productName.trim().toLowerCase()
          ) {
            return false;
          }

          // 4. Đúng ngôn ngữ đang xem: en phải là 'en', vi phải là 'vi-VN'
          if (item.language !== targetLang) {
            return false;
          }

          // 1. Cùng thương hiệu (Intel hoặc AMD)
          const itemBrand = getProductBrand(item).toUpperCase();
          if (itemBrand !== targetBrand.toUpperCase()) {
            return false;
          }

          return true;
        });

        // 2. Sắp xếp thứ tự giảm dần theo số lượng Views
        const sorted = [...filtered].sort((a, b) => {
          const viewsA = getProductViewCount(a);
          const viewsB = getProductViewCount(b);
          return viewsB - viewsA;
        });

        if (isMounted) {
          setProducts(sorted.slice(0, 4));
        }
      } catch (err) {
        console.error('[MoreLikeThisCode] Error querying Sitecore Search:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchMoreLikeThis();

    return () => {
      isMounted = false;
    };
  }, [productId, productName, brand, locale, targetBrand, localeKey, cleanId]);

  if (!loading && products.length === 0) return null;

  const isIntel = targetBrand.toUpperCase() === 'INTEL';

  return (
    <section className="mx-auto max-w-7xl px-6 py-8" aria-labelledby="custom-code-title">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              Use Sitecore Search API to query products by Brand and Views
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                isIntel
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-orange-100 text-orange-800 border border-orange-200'
              }`}
            >
              Brand: {targetBrand}
            </span>
          </div>
          <h2 id="custom-code-title" className="text-2xl font-black text-slate-900 tracking-tight">
            More Like This <span className="text-emerald-600">(By Code — Brand &amp; Views)</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {localeKey.startsWith('vi')
              ? `Lấy sản phẩm cùng thương hiệu ${targetBrand} từ Sitecore Search, sắp xếp giảm dần theo số lượng Views`
              : `Products matching brand ${targetBrand} queried via Sitecore Search, sorted descending by View count`}
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
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => {
            const href = product.product_url || `/${locale}/products/${encodeURIComponent(product.name ?? '')}`;
            const itemBrand = getProductBrand(product);
            const itemViews = getProductViewCount(product);
            const isItemIntel = itemBrand.toUpperCase() === 'INTEL';

            return (
              <a
                key={product.id ?? product.name ?? index}
                href={href}
                onClick={() => {
                  if (!product.id) return;
                  void trackSearchResultsClickEntityEvent('rfkid_7', 'product', {
                    index,
                    items: [{ id: product.id }],
                    numResults: products.length,
                  }).catch((error) => {
                    console.warn('[Sitecore Search] Related product click tracking failed:', error);
                  });
                }}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="relative flex h-40 items-center justify-center bg-slate-50 p-4">
                    {/* View count badge */}
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-slate-900/85 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm backdrop-blur-sm">
                      <Eye size={12} strokeWidth={2.5} />
                      {itemViews.toLocaleString()} views
                    </span>

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
                    <div className="mb-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          isItemIntel
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-orange-50 text-orange-700 border border-orange-200'
                        }`}
                      >
                        Brand: {itemBrand}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-600">
                      {product.name}
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
 * CÁCH 2: XỬ LÝ BẰNG WIDGET (SITECORE SEARCH RECOMMENDATION WIDGET rfkid_35)
 * Sử dụng hook useRecommendation kết hợp recipe AI đã cấu hình trên CEC
 * ═══════════════════════════════════════════════════════════════════════════════
 */
function ProductMoreLikeThisWidgetResults({
  productId,
  brand,
  rfkId = 'rfkid_35',
}: ProductMoreLikeThisProps) {
  const locale = useLocale();
  const cleanId = (productId || '').replace(/[{}-]/g, '').toUpperCase();
  const localeKey = normalizeLanguage(locale);
  const initializedKey = useRef('');

  // Cung cấp context product ID cho Widget Recommendation OOTB
  useEffect(() => {
    if (!productId) return;
    const key = `${productId}_${locale}`;
    if (initializedKey.current === key) return;
    initializedKey.current = key;

    const candidateIds = [
      `${cleanId}_${locale}`,
      `${cleanId}_en`,
      `${productId}_${locale}`,
      productId,
    ];
    PageController.getContext().setEntityIds('product', candidateIds);
  }, [productId, cleanId, locale]);

  const targetLang = locale.toLowerCase().startsWith('vi') ? 'vi-VN' : 'en';

  const { widgetRef, queryResult } = useRecommendation<RelatedProduct, { itemsPerPage: number }>({
    state: { itemsPerPage: 12 },
    query: (requestQuery) => {
      const request = requestQuery.getRequest();
      request.setSearchLimit(12);
      if (typeof (request as any).setRecommendationsLimit === 'function') {
        (request as any).setRecommendationsLimit(12);
      }
      request.setSearchFilter(new FilterEqual('language', targetLang));
    },
  });

  const products = (queryResult.data?.content ?? [])
    .filter((p) => p.language === targetLang)
    .slice(0, 4);

  return (
    <section
      ref={widgetRef}
      data-rfkid={rfkId}
      className="mx-auto max-w-7xl px-6 py-8"
      aria-labelledby="widget-rfk35-title"
    >
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300">
              Use Widget (rfkid_35)
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
              OOTB Recommendation Recipe
            </span>
          </div>
          <h2 id="widget-rfk35-title" className="text-2xl font-black text-slate-900 tracking-tight">
            More Like This <span className="text-purple-600">(Sitecore Search Widget rfkid_35)</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {localeKey.startsWith('vi')
              ? 'Gợi ý trực tiếp từ Sitecore Search Recommendation Recipe được cấu hình trên CEC'
              : 'Direct recommendations served by Sitecore Search Recommendation Widget and Recipe configured in CEC'}
          </p>
        </div>
      </div>

      {queryResult.isLoading || queryResult.isFetching ? (
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
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
          Widget rfkid_35 chưa có dữ liệu tương đồng hoặc đang chạy fallback.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => {
            const href = product.product_url || `/${locale}/products/${encodeURIComponent(product.name ?? '')}`;
            const itemBrand = getProductBrand(product);
            const isItemIntel = itemBrand.toUpperCase() === 'INTEL';

            return (
              <a
                key={product.id ?? product.name ?? index}
                href={href}
                onClick={() => {
                  if (!product.id) return;
                  void trackRecommendationClickEntityEvent(rfkId, 'product', {
                    index,
                    items: [{ id: product.id }],
                  }).catch((error) => {
                    console.warn('[Sitecore Search] More Like This product click tracking failed:', error);
                  });
                }}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-40 items-center justify-center bg-slate-50 p-4">
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
                    <div className="mb-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          isItemIntel
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-orange-50 text-orange-700 border border-orange-200'
                        }`}
                      >
                        Brand: {itemBrand}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-purple-600">
                      {product.name}
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

const ProductMoreLikeThisWidget = widget(
  ProductMoreLikeThisWidgetResults,
  WidgetDataType.RECOMMENDATION,
  'product'
);

/**
 * Component chính xuất ra ngoài PDP, hiển thị đồng thời cả 2 cách để dễ dàng so sánh
 */
export function ProductMoreLikeThis(props: ProductMoreLikeThisProps) {
  return (
    <div className="bg-slate-50/50 py-6 border-t border-slate-200">
      {/* 1. Xử lý bằng Code */}
      <ProductMoreLikeThisCode {...props} />

      {/* 2. Xử lý bằng Widget Recommendation OOTB */}
      <ProductMoreLikeThisWidget {...props} rfkId={props.rfkId || 'rfkid_35'} />
    </div>
  );
}

export default ProductMoreLikeThis;
