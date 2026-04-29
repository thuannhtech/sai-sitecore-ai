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

export const Default = ({ params, fields, page }: SkateProductListProps): JSX.Element => {
  const locale = useLocale();

  console.log('fields', fields);

  // 1. Resolve ProductsRoot (Ưu tiên dùng ID để GraphQL tìm kiếm chính xác 100%)
  const datasource = fields?.data?.datasource || fields?.data?.contextItem || fields;
  const datasourcePath = datasource?.ProductsRoot?.id || datasource?.ProductsRoot?.url || datasource?.ProductsRoot?.targetItem?.path || datasource?.ProductsRoot?.value;

  const contextFields = page?.layout?.sitecore?.route?.fields || (page as any)?.fields;
  const contextPath = contextFields?.ProductsRoot?.id || contextFields?.ProductsRoot?.url || contextFields?.ProductsRoot?.targetItem?.path || contextFields?.ProductsRoot?.value;

  const rootPath = datasourcePath || contextPath;

  // 2. State management
  const [products, setProducts] = useState<Product[]>([])
  const [displayList, setDisplayList] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<SortOption>('name-asc')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // 3. Fetch products from API (using our updated route.ts)
  const loadData = useCallback(async () => {
    if (!rootPath) return
    setLoading(true)
    try {
      const urlParams = new URLSearchParams({
        q: '', // Fetch all and filter on client for smoother feel in this demo
        sort: 'name-asc',
        locale: locale || 'en',
        rootPath: rootPath
      })
      const res = await fetch(`/api/products?${urlParams.toString()}`)
      const data = await res.json()
      if (!data.error) {
        setProducts(data.items || [])
      }
    } catch (err) {
      console.error('Fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }, [rootPath, locale])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 4. Client-side Search & Sort
  useEffect(() => {
    let result = [...products]
    if (q) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.description?.toLowerCase().includes(q.toLowerCase())
      )
    }
    result.sort((a, b) => {
      const [key, dir] = sort.split('-')
      const mul = dir === 'desc' ? -1 : 1
      if (key === 'price') return ((a.price || 0) - (b.price || 0)) * mul
      return a.name.localeCompare(b.name) * mul
    })
    setDisplayList(result)
  }, [q, sort, products])

  if (!rootPath) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
        Vui lòng cấu hình field <strong>ProductsRoot</strong> trên trang hoặc Datasource.
      </div>
    )
  }

  return (
    <div className={`component skate-product-list ${params?.styles || ''}`} id={params?.RenderingIdentifier}>
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 p-4 rounded-2xl">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <svg className="absolute left-3 top-2.5 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </div>

          <div className="flex items-center gap-3">
            <select
              className="bg-white border-none ring-1 ring-gray-200 rounded-xl py-2 px-4 focus:ring-2 focus:ring-blue-500"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
            >
              <option value="name-asc">A-Z</option>
              <option value="name-desc">Z-A</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            <div className="flex bg-white ring-1 ring-gray-200 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400'}`}
              >
                <GridIcon />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400'}`}
              >
                <ListIcon />
              </button>
            </div>
          </div>
        </div>

        {/* List/Grid */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6' : 'flex flex-col gap-4'}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`bg-gray-50 rounded-2xl animate-pulse ${viewMode === 'grid' ? 'flex flex-col' : 'flex flex-row p-3 gap-4 items-center'}`}>
                <div className={`${viewMode === 'grid' ? 'w-full aspect-square' : 'w-24 h-24 shrink-0'} bg-gray-200 rounded-xl`} />
                <div className="p-4 flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 rounded-md w-3/4" />
                  <div className="h-4 bg-gray-200 rounded-md w-1/4" />
                  {viewMode === 'list' && <div className="h-3 bg-gray-200 rounded-md w-1/2" />}
                </div>
              </div>
            ))}
          </div>
        ) : displayList.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6' : 'flex flex-col gap-4'}>
            {displayList.map((product) => (
              <div
                key={product.slug}
                className={`group bg-white border border-gray-100 overflow-hidden transition-all hover:shadow-md ${viewMode === 'grid' ? 'flex flex-col rounded-2xl' : 'flex flex-row items-center rounded-xl p-3 gap-4'
                  }`}
              >
                <Link
                  href={`/products/${product.slug.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`${viewMode === 'grid' ? 'w-full aspect-square' : 'w-24 h-24 shrink-0'} bg-gray-50 relative rounded-xl overflow-hidden`}
                >
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                  )}
                </Link>
                <div className="p-4 flex-1 flex flex-col">
                  <Link href={`/products/${product.slug.toLowerCase().replace(/\s+/g, '-')}`}>
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-blue-600 font-bold mt-1 text-lg">
                    ${product.price?.toLocaleString()}
                  </p>
                  {viewMode === 'list' && product.description && (
                    <p className="text-gray-500 text-sm mt-1 line-clamp-1">{product.description}</p>
                  )}
                  
                  <div className="mt-4">
                    <SkateAddToCartButton 
                      product={{
                        id: product.slug, // Dùng slug làm ID tạm thời cho mock
                        name: product.name,
                        price: product.price || 0,
                        imageUrl: product.image
                      }} 
                      className="w-full py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400">
            No products found.
          </div>
        )}
      </div>
    </div>
  )
}

export default Default
