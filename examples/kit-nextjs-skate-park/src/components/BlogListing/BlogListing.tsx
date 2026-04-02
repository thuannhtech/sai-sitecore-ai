'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import client from 'src/lib/sitecore-client';
import { ImageField, RichText, Text } from '@sitecore-content-sdk/nextjs';
import { Link } from 'src/i18n/navigation';
import { useLocale } from 'next-intl';
import { BlogListingProps, SitecoreField, BlogItem, RenderingParams } from './BlogListing.types';

// --- GraphQL Query ---
const GET_BLOG_ITEMS_QUERY = `
  query GetBlogChildren($path: String!, $lang: String!) {
    item(path: $path, language: $lang) {
      children {
        results {
          id
          name
          url {
            path
          }
          fields {
            id
            name
            jsonValue
          }
        }
      }
    }
  }
`;

// --- Utility Functions ---
const getFieldValue = (fields: SitecoreField[], fieldName: string): string => {
    return fields.find((f) => f.name === fieldName)?.jsonValue?.value || '';
};

const getField = (fields: SitecoreField[], fieldName: string) => {
    return fields.find((field) => field.name === fieldName);
};

const getImageUrl = (fields: SitecoreField[], fieldName: string) => {
    const imageField: ImageField = getField(fields, fieldName)?.jsonValue as ImageField;
    return imageField?.value?.src || '';
};

const getCategories = (fields: SitecoreField[], fieldName: string): string[] => {
    const categoryField = getField(fields, fieldName)?.jsonValue;

    if (!Array.isArray(categoryField)) return [];

    return categoryField
        .map((item: any) => {
            return (
                item?.fields?.DisplayName?.value ||
                item?.fields?.Value?.value ||
                item?.displayName ||
                item?.name ||
                ''
            );
        })
        .filter(Boolean);
};


// --- Sub-Components ---
const SkeletonCard = () => (
    <div className="flex flex-col border border-gray-100 bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-200 w-full"></div>
        <div className="p-5 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="pt-4 border-t flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
        </div>
    </div>
);

const stripHtml = (html: string) => {
    if (!html) return '';
    return html
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\s+/g, ' ')
        .trim();
};


const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trim()}...`;
};

const formatDate = (dateValue: string, locale: string = 'en-US') => {
    if (!dateValue) return 'Just now';

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'Just now';

    return date.toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};


const BlogCard = ({ item, locale }: { item: BlogItem; locale: string }) => {

    const title = getFieldValue(item.fields, 'Title') || 'No title available for this post. Please read more to find out the details.';
    const rawContent = getFieldValue(item.fields, 'Content') || '';
    const summary = truncateText(stripHtml(rawContent), 140) || 'No description available for this post. Please read more to find out the details.';
    const date = formatDate(getFieldValue(item.fields, 'PublishDate'), locale);
    const categories = getCategories(item.fields, 'Categories');
    const image = getImageUrl(item.fields, 'Image');
    const url = item?.url.path;

    return (
        <article className="group flex flex-col bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
            <div className="relative h-48 bg-gray-100 overflow-hidden">
                {image ? (
                    <Link href={url}>
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            style={{ height: '100%' }}
                            loading="lazy"
                        />
                    </Link>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 opacity-80" />
                )}

                {categories.length > 0 && (
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2 pr-3">
                        {categories.slice(0, 2).map((cat, idx) => (
                            <span
                                key={`${cat}-${idx}`}
                                className="bg-white/90 backdrop-blur px-2 py-1 text-xs font-semibold text-blue-600 rounded-md shadow-sm"
                            >
                                {cat}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    <Link href={url}>
                        {title}
                    </Link>
                </h3>

                <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-grow leading-relaxed">
                    {summary}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                    <span>{date}</span>
                    <Link href={url}>
                        <span className="font-medium text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                            Read more <span aria-hidden="true">&rarr;</span>
                        </span>
                    </Link>
                </div>
            </div>
        </article>
    );
};

// --- Main Component ---
const BlogListing: React.FC<BlogListingProps> = (props) => {

    const { rendering } = props;
    const [items, setItems] = useState<BlogItem[]>([]);
    const [keyword, setKeyword] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);

    const renderingParams: RenderingParams = rendering.params || {};
    const rootFolder = renderingParams.BlogsFolder;
    const pageSize = parseInt(renderingParams.Limit || '6', 10); // Đổi default thành 6 cho đẹp Grid 3 cột

    const locale = useLocale();

    const fetchData = useCallback(async () => {
        if (!rootFolder) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const excludedNames = ['Data'];
            const res: any = await client.getData(GET_BLOG_ITEMS_QUERY, {
                path: rootFolder,
                lang: locale,
            });

            console.log("res", res.item?.children?.results)

            const results: BlogItem[] = res?.item?.children?.results?.filter((item: any) => {
                return !excludedNames.includes(item.name);
            }) ?? [];

            setItems(results);
        } catch (ex) {
            console.log('Failed to fetch blog items:', ex);
        } finally {
            setLoading(false);
        }
    }, [rootFolder, locale]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Memoized Logic ---
    const filteredItems = useMemo(() => {
        if (!keyword.trim()) return items;
        const lowerKeyword = keyword.toLowerCase();
        return items.filter((item) => item.name.toLowerCase().includes(lowerKeyword));
    }, [items, keyword]);

    const totalPages = Math.ceil(filteredItems.length / pageSize);

    const paginatedItems = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredItems.slice(start, start + pageSize);
    }, [filteredItems, page, pageSize]);

    // Handle Input change
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
        setPage(1); // Reset về trang 1 khi search
    };

    return (
        <section className="bg-gray-50/50 py-12 min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            <Text field={rendering.fields.SectionTitle} />
                        </h2>
                        <div className="mt-2 text-gray-500">
                            <RichText field={rendering.fields.SectionDescription} />
                        </div>
                    </div>

                    <div className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={keyword}
                            onChange={handleSearch}
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm shadow-sm text-black"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        /* Skeleton Loading State */
                        Array.from({ length: pageSize }).map((_, idx) => <SkeletonCard key={idx} />)
                    ) : paginatedItems.length > 0 ? (
                        paginatedItems.map((item) => <BlogCard key={item.id} item={item} locale={locale} />)
                    ) : (
                        /* Empty State */
                        <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-gray-300">
                            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                            <p className="mt-1 text-sm text-gray-500">Try adjusting your search keyword.</p>
                            <button
                                onClick={() => setKeyword('')}
                                className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-500"
                            >
                                Clear search
                            </button>
                        </div>
                    )}
                </div>

                {!loading && totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(page * pageSize, filteredItems.length)}</span> of <span className="font-medium">{filteredItems.length}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Previous</span>
                                        &larr; Prev
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${p === page
                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next &rarr;
                                        <span className="sr-only">Next</span>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default BlogListing;