'use client';

import { useLocale } from 'next-intl';
import { FilterEqual, useRecommendation, widget } from '@sitecore-search/react';
import { WidgetDataType } from '@sitecore-search/data';

const MAY_WE_SUGGEST_RFK_ID = 'rfkid_31';
const RECOMMENDATION_LIMIT = 16;
const DISPLAY_LIMIT = 4;

type BlogRecommendation = {
  id?: string;
  name?: string;
  title?: string;
  summary?: string;
  image_link?: string | null;
  image_alt?: string;
  publish_date?: string;
  author?: string;
  language?: string;
  url?: string;
};

const normalizeLanguage = (language: string) => language.trim().replace(/_/g, '-').toLowerCase();

function MayWeSuggestResults({ rfkId }: { rfkId: string }) {
  const locale = useLocale();
  const { widgetRef, queryResult } = useRecommendation<BlogRecommendation, { itemsPerPage: number }>({
    state: { itemsPerPage: RECOMMENDATION_LIMIT },
    query: (query) => {
      const request = query.getRequest();
      request.setSearchLimit(RECOMMENDATION_LIMIT);
      request.setSearchFilter(new FilterEqual('language', locale));
    },
  });

  const localeKey = normalizeLanguage(locale);
  const isVietnamese = localeKey === 'vi-vn';
  const items = (queryResult.data?.content ?? [])
    .filter((item) => item.language && normalizeLanguage(item.language) === localeKey)
    .slice(0, DISPLAY_LIMIT);
  const loading = queryResult.isLoading || queryResult.isFetching;

  return (
    <section
      ref={widgetRef}
      data-rfkid={rfkId}
      className="mx-auto max-w-[1200px] px-4 py-12 md:px-8 lg:px-12"
      aria-labelledby="may-we-suggest-title"
    >
      <div className="mb-7">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
          {isVietnamese ? 'Đọc tiếp' : 'Keep reading'}
        </p>
        <h2 id="may-we-suggest-title" className="text-2xl font-bold text-slate-900 md:text-3xl">
          {isVietnamese ? 'Có thể bạn cũng thích' : 'You may also like'}
        </h2>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500" aria-live="polite">
          {isVietnamese ? 'Đang tải bài viết…' : 'Loading articles…'}
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500">
          {isVietnamese ? 'Chưa có bài viết gợi ý bằng ngôn ngữ này.' : 'No articles are available right now.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => {
            const slug = item.name;
            const localePrefix = localeKey === 'en' ? '' : `/${locale}`;
            const href = item.url || (slug ? `${localePrefix}/blogs/${encodeURIComponent(slug)}` : `${localePrefix}/blogs`);

            return (
              <a
                key={item.id ?? slug ?? index}
                href={href}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-44 items-center justify-center overflow-hidden bg-slate-50 p-4">
                  {item.image_link ? (
                    <img
                      src={item.image_link}
                      alt={item.image_alt || item.title || ''}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-sm text-slate-400">{isVietnamese ? 'Không có hình ảnh' : 'No image available'}</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-2 min-h-12 font-semibold leading-6 text-slate-900 group-hover:text-blue-700">
                    {item.title || item.name || (isVietnamese ? 'Bài viết' : 'Article')}
                  </h3>
                  {item.summary ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{item.summary}</p>
                  ) : null}
                  {(item.author || item.publish_date) ? (
                    <p className="mt-auto pt-4 text-xs text-slate-500">
                      {[item.author, item.publish_date ? new Date(item.publish_date).toLocaleDateString(locale) : '']
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
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

export const BlogMayWeSuggest = widget(
  MayWeSuggestResults,
  WidgetDataType.RECOMMENDATION,
  'blogitem'
);

export default function BlogMayWeSuggestWidget() {
  return <BlogMayWeSuggest rfkId={MAY_WE_SUGGEST_RFK_ID} />;
}
