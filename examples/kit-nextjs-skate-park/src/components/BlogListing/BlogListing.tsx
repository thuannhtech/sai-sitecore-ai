'use client';

import React, { useEffect, useState, useCallback } from 'react';
import client from 'src/lib/sitecore-client';

// --- Interfaces ---
interface SitecoreField {
    name: string;
    jsonValue: any;
}

interface BlogItem {
    id: string;
    name: string;
    fields: SitecoreField[];
}

interface BlogListingProps {
    rendering: {
        params?: {
            BlogsFolder?: string;
            LIMIT?: string;
        };
    };
}

// --- GraphQL Query ---
// Template ID: {0CDBDCDF-4193-4748-B92F-43519D68C28E}
const GET_BLOG_ITEMS_QUERY = `
  query GetBlogChildren($path: String!, $lang: String!, $templateId: String!) {
    item(path: $path, language: $lang) {
      children(includeTemplateIDs: [$templateId]) {
        results {
          id
          name
          fields {
            name
            jsonValue
          }
        }
      }
    }
  }
`;

const BLOG_TEMPLATE_ID = '{0CDBDCDF-4193-4748-B92F-43519D68C28E}';

const BlogListing: React.FC<BlogListingProps> = ({ rendering }) => {
    const rootFolder = rendering?.params?.BlogsFolder;
    const pageSize = parseInt(rendering?.params?.LIMIT || '1', 10);

    const [items, setItems] = useState<BlogItem[]>([]);
    const [keyword, setKeyword] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);

    // Helper function để lấy giá trị field theo tên từ array fields
    const getFieldValue = (fields: SitecoreField[], fieldName: string) => {
        return fields.find((f) => f.name === fieldName)?.jsonValue?.value || '';
    };

    const fetchData = useCallback(async () => {
        if (!rootFolder) return;

        setLoading(true);
        try {
            const res: any = await client.getData(GET_BLOG_ITEMS_QUERY, {
                path: rootFolder,
                lang: 'en',
                templateId: BLOG_TEMPLATE_ID,
            });

            const results: BlogItem[] = res?.item?.children?.results || [];
            setItems(results);
        } catch (ex) {
            console.error('Fetch error:', ex);
        } finally {
            setLoading(false);
        }
    }, [rootFolder]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Filter & Pagination Logic ---
    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(keyword.toLowerCase())
    );

    const totalPages = Math.ceil(filteredItems.length / pageSize);
    const paginatedItems = filteredItems.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    return (
        <div className="blog-listing max-w-5xl mx-auto p-4">
            {/* 🔍 Search */}
            <input
                type="text"
                placeholder="Search blog..."
                value={keyword}
                onChange={(e) => {
                    setKeyword(e.target.value);
                    setPage(1);
                }}
                className="border px-3 py-2 w-full mb-4 text-black"
            />

            {/* 🔄 Loading State */}
            {loading ? (
                <p className="text-center py-10">Loading blogs...</p>
            ) : (
                <>
                    {/* 📦 List Items */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {paginatedItems.length > 0 ? (
                            paginatedItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="border p-4 rounded shadow hover:shadow-lg transition flex flex-col justify-between"
                                >
                                    <div>
                                        <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                                        {/* Ví dụ cách lấy field cụ thể (ví dụ field 'Title' hoặc 'Summary') */}
                                        <p className="text-sm text-gray-600 line-clamp-3">
                                            {getFieldValue(item.fields, 'Summary')}
                                        </p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t text-xs text-gray-400">
                                        ID: {item.id}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="col-span-3 text-center text-gray-500">No blogs found.</p>
                        )}
                    </div>

                    {/* 📄 Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8 gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`px-4 py-2 border rounded transition ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BlogListing;