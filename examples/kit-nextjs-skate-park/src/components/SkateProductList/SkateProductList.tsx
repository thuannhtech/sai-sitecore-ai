'use client'

import React, { JSX, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { SkateAddToCartButton } from '../SkateCart/SkateAddToCartButton'

/* ── Types (Follow Title.tsx pattern) ───────── */
interface SkateProductListProps {
  params: {
    styles?: string
    RenderingIdentifier?: string
    [key: string]: string | undefined
  }
  fields?: {
    data?: {
      datasource?: any
      contextItem?: any
    }
    ProductsRoot?: any // Nếu field ở trên Datasource
  }
  page?: {
    layout?: {
      sitecore?: {
        route?: {
          fields?: {
            [key: string]: any
          }
        }
      }
    }
  }
}

type Product = {
  name: string
  image?: string
  price?: number | null
  description?: string
  url?: string
  slug: string
}

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'
type ViewMode = 'grid' | 'list'

/* ── Icons ──────────────────────────────────── */
const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
)

const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)

export const Default = ({ params, fields, page: sitecorePage }: SkateProductListProps): JSX.Element => {
  const locale = useLocale();

  // 1. Resolve ProductsRoot
  const datasource = fields?.data?.datasource || fields?.data?.contextItem || fields;
  const datasourcePath = datasource?.ProductsRoot?.id || datasource?.ProductsRoot?.url || datasource?.ProductsRoot?.targetItem?.path || datasource?.ProductsRoot?.value;

  const contextFields = sitecorePage?.layout?.sitecore?.route?.fields || (sitecorePage as any)?.fields;
  const contextPath = contextFields?.ProductsRoot?.id || contextFields?.ProductsRoot?.url || contextFields?.ProductsRoot?.targetItem?.path || contextFields?.ProductsRoot?.value;

  const rootPath = datasourcePath || contextPath;

  // 2. State management
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [sort, setSort] = useState<SortOption>('name-asc')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [total, setTotal] = useState(0)

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQ(q)
      setPage(1) // Reset to first page on search
    }, 500)
    return () => clearTimeout(handler)
  }, [q])

  // Reset page on sort/pageSize change
  useEffect(() => {
    setPage(1)
  }, [sort, pageSize])

  // 3. Fetch products from API
  const loadData = useCallback(async () => {
    if (!rootPath) return
    setLoading(true)
    try {
      const urlParams = new URLSearchParams({
        q: debouncedQ,
        sort: sort,
        page: page.toString(),
        pageSize: pageSize.toString(),
        locale: locale || 'en',
        rootPath: rootPath
      })
      const res = await fetch(`/api/products?${urlParams.toString()}`)
      const data = await res.json()
      if (!data.error) {
        setProducts(data.items || [])
        setTotal(data.total || 0)
      }
    } catch (err) {
      console.error('Fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }, [rootPath, locale, debouncedQ, sort, page, pageSize])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (!rootPath) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-[10px] text-gray-400">
        Vui lòng cấu hình field <strong>ProductsRoot</strong> trên trang hoặc Datasource.
      </div>
    )
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className={`component skate-product-list ${params?.styles || ''}`} id={params?.RenderingIdentifier}>
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 p-4 rounded-[10px] shadow-sm">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 rounded-[10px] border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 shadow-sm transition-shadow"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <svg className="absolute left-3 top-2.5 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[15px] text-gray-500 font-medium">Show:</span>
              <select
                className="bg-white border-none ring-1 ring-gray-200 rounded-[10px] py-2 px-3 focus:ring-2 focus:ring-blue-500 shadow-sm text-[15px] outline-none cursor-pointer hover:ring-gray-300 transition-all"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={4}>4</option>
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={16}>16</option>
                <option value={24}>24</option>
              </select>
            </div>

            <select
              className="bg-white border-none ring-1 ring-gray-200 rounded-[10px] py-2 px-4 focus:ring-2 focus:ring-blue-500 shadow-sm text-[15px] outline-none cursor-pointer hover:ring-gray-300 transition-all"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
            >
              <option value="name-asc">A-Z</option>
              <option value="name-desc">Z-A</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            <div className="flex bg-white ring-1 ring-gray-200 p-1 rounded-[10px] shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-[8px] transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              >
                <GridIcon />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-[8px] transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              >
                <ListIcon />
              </button>
            </div>
          </div>
        </div>

        {/* List/Grid */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6' : 'flex flex-col gap-4'}>
            {[...Array(pageSize)].map((_, i) => (
              <div key={i} className={`bg-white border border-gray-100 rounded-[10px] shadow-sm animate-pulse ${viewMode === 'grid' ? 'flex flex-col' : 'flex flex-row p-3 gap-4 items-center'}`}>
                <div className={`${viewMode === 'grid' ? 'w-full aspect-square rounded-t-[10px]' : 'w-24 h-24 shrink-0 rounded-[10px]'} bg-gray-100`} />
                <div className="p-5 flex-1 space-y-3 w-full">
                  <div className="h-5 bg-gray-100 rounded-md w-3/4" />
                  <div className="h-4 bg-gray-100 rounded-md w-1/4" />
                  {viewMode === 'list' && <div className="h-3 bg-gray-100 rounded-md w-1/2" />}
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6' : 'flex flex-col gap-4'}>
              {products.map((product) => (
                <div
                  key={product.slug}
                  className={`group bg-white border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 ${viewMode === 'grid' ? 'flex flex-col rounded-[10px]' : 'flex flex-row items-center rounded-[10px] p-3 gap-4'
                    }`}
                >
                  <Link
                    href={`/products/${product.slug.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`${viewMode === 'grid' ? 'w-full aspect-square' : 'w-28 h-28 shrink-0 rounded-[10px]'} bg-gray-50 relative overflow-hidden`}
                  >
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-[15px] font-medium">No Image</div>
                    )}
                  </Link>
                  <div className="p-5 flex-1 flex flex-col">
                    <Link href={`/products/${product.slug.toLowerCase().replace(/\s+/g, '-')}`}>
                      <h3 className="text-[17px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-blue-600 font-black mt-2 text-xl">
                      ${product.price?.toLocaleString()}
                    </p>
                    {viewMode === 'list' && product.description && (
                      <p className="text-gray-500 text-[15px] mt-2 line-clamp-2 leading-relaxed">{product.description}</p>
                    )}

                    <div className="mt-5">
                      <SkateAddToCartButton
                        product={{
                          id: product.slug,
                          name: product.name,
                          price: product.price || 0,
                          imageUrl: product.image
                        }}
                        className="w-full py-2.5 text-[15px] font-bold cursor-pointer tracking-wide rounded-[8px] shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-10 pb-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-[15px] font-bold text-gray-700 bg-white border border-gray-200 rounded-[5px] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                >
                  Prev
                </button>

                <div className="flex items-center gap-1.5">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      totalPages <= 5 ||
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-15 h-13 flex items-center justify-center text-[15px] font-bold rounded-[5px] transition-all shadow-sm active:scale-95 ${page === pageNum
                            ? 'bg-blue-600 text-white border border-blue-600'
                            : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === page - 2 ||
                      pageNum === page + 2
                    ) {
                      return <span key={pageNum} className="px-1 text-gray-400 font-medium">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-[15px] font-bold text-gray-700 bg-white border border-gray-200 rounded-[5px] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center bg-gray-50 rounded-[10px] border border-dashed border-gray-200">
            <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900">Không tìm thấy sản phẩm</h3>
            <p className="mt-1 text-[15px] text-gray-500 max-w-sm">Chúng tôi không tìm thấy sản phẩm nào khớp với yêu cầu của bạn. Thử dùng từ khóa khác xem sao.</p>
            <button
              onClick={() => { setQ(''); setSort('name-asc'); setPage(1); }}
              className="mt-6 px-6 py-2 bg-white border border-gray-200 text-[15px] font-bold text-gray-700 rounded-[10px] shadow-sm hover:bg-gray-50 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Default
