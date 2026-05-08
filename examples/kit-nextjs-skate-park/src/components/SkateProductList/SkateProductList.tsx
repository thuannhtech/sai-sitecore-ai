'use client'

import React, { JSX, useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { SkateAddToCartButton } from '../SkateCart/SkateAddToCartButton'

/* ── Types ──────────────────────────────────── */
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
    ProductsRoot?: any
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

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
)

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
)

/* ── Main Component ─────────────────────────── */
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
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [total, setTotal] = useState(0)

  // Upgrade States
  const [priceRange, setPriceRange] = useState<number>(99999)
  const [availability, setAvailability] = useState<string[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [openAccordions, setOpenAccordions] = useState<string[]>(['search', 'price', 'availability', 'pageSize'])

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQ(q)
      setPage(1)
    }, 500)
    return () => clearTimeout(handler)
  }, [q])

  // Fetch data
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

  // Client-side filtering logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Filter by Price
      if (p.price && p.price > priceRange) return false

      // Filter by Availability (Mock logic since data might not have it)
      if (availability.length > 0) {
        const isAvailable = (p.price || 0) > 0;
        if (availability.includes('in-stock') && !isAvailable) return false;
        if (availability.includes('pre-order') && isAvailable) return false;
      }

      return true
    })
  }, [products, priceRange, availability])

  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
  }

  const clearFilters = () => {
    setQ('')
    setPriceRange(1000)
    setAvailability([])
    setPage(1)
  }

  if (!rootPath) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 bg-slate-50 font-bold uppercase tracking-widest italic">
        Configure <span className="text-slate-900 mx-1 underline decoration-orange-500 underline-offset-4">ProductsRoot</span> on Datasource
      </div>
    )
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className={`component skate-product-list bg-white min-h-screen ${params?.styles || ''}`} id={params?.RenderingIdentifier}>
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row min-h-screen relative">

        {/* Mobile Filter Button */}
        <div className="md:hidden p-4 sticky top-0 bg-white/90 backdrop-blur-sm z-20 border-b border-slate-100 flex justify-between items-center">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl font-black text-xs tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all"
          >
            <FilterIcon /> FILTERS
          </button>
          <span className="text-slate-500 text-[15px] font-bold uppercase tracking-tighter italic">{total} gear items</span>
        </div>

        {/* ── LEFT SIDEBAR (Desktop) ─────────────────── */}
        <aside className={`
          fixed inset-0 z-50 md:relative md:inset-auto md:z-0
          w-full md:w-[280px] bg-white text-slate-600 
          duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          overflow-y-auto border-r border-slate-100 scrollbar-hide
          md:sticky md:top-0 md:h-screen shadow-xl shadow-slate-200/50 md:shadow-none
        `}>
          <div className="p-8 space-y-10">
            <div className="flex justify-between items-center">
              <h2 className="text-slate-900 font-black tracking-tighter text-3xl uppercase italic leading-none"><span className="text-[#1965e1]">Product Filters</span></h2>
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-900 bg-slate-100 p-2 rounded-full">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-8">
              {/* Search Accordion */}
              <div className="border-b border-slate-100 pb-8">
                <button onClick={() => toggleAccordion('search')} className="flex justify-between items-center w-full text-left mb-6">
                  <span className="text-slate-900 font-black uppercase tracking-widest text-[15px]">Keyword Search</span>
                  <ChevronDownIcon className={`text-slate-400 duration-300 ${openAccordions.includes('search') ? '' : '-rotate-90'}`} />
                </button>
                {openAccordions.includes('search') && (
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full bg-slate-50 border-none ring-1 ring-slate-200 rounded-xl py-4 pl-4 pr-10 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#1965e1] transition-all outline-none text-[15px] font-bold"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                    />
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[#1965e1] transition-colors" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="6" cy="6" r="5" /><path d="M10 10l3 3" /></svg>
                  </div>
                )}
              </div>

              {/* Price Range Accordion */}
              <div className="border-b border-slate-100 pb-8">
                <button onClick={() => toggleAccordion('price')} className="flex justify-between items-center w-full text-left mb-6">
                  <span className="text-slate-900 font-black uppercase tracking-widest text-[15px]">Price Cap</span>
                  <ChevronDownIcon className={`text-slate-400 duration-300 ${openAccordions.includes('price') ? '' : '-rotate-90'}`} />
                </button>
                {openAccordions.includes('price') && (
                  <div className="space-y-6">
                    <input
                      type="range"
                      min="0" max="1000" step="10"
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#1965e1] transition-all"
                      value={priceRange}
                      onChange={(e) => setPriceRange(Number(e.target.value))}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-[15px] font-black text-slate-300">$0</span>
                      <div className="flex flex-col items-end">
                        <span className="text-[15px] font-black text-white bg-[#1965e1] px-4 py-2 rounded-lg shadow-lg shadow-[#1965e1]/20 tracking-tighter">Under ${priceRange}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Page Size Accordion */}
              <div className="border-b border-slate-100 pb-8">
                <button onClick={() => toggleAccordion('pageSize')} className="flex justify-between items-center w-full text-left mb-6">
                  <span className="text-slate-900 font-black uppercase tracking-widest text-[15px]">Show Per Page</span>
                  <ChevronDownIcon className={`text-slate-400 duration-300 ${openAccordions.includes('pageSize') ? '' : '-rotate-90'}`} />
                </button>
                {openAccordions.includes('pageSize') && (
                  <div className="grid grid-cols-2 gap-3">
                    {[8, 12, 24, 48].map(size => (
                      <button
                        key={size}
                        onClick={() => setPageSize(size)}
                        className={`py-4 px-3 rounded-xl text-[15px] font-black border-2 transition-all ${pageSize === size ? 'bg-[#1965e1] border-[#1965e1] text-white shadow-lg shadow-[#1965e1]/30' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600'}`}
                      >
                        {size} ITEMS
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={clearFilters}
              className="w-full py-5 bg-slate-50 hover:bg-[#1965e1] hover:text-white text-slate-900 text-[15px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all border border-slate-100 hover:border-[#1965e1]"
            >
              Clear All
            </button>
          </div>
        </aside>

        {/* ── RIGHT CONTENT AREA ─────────────────────── */}
        <main className="flex-1 min-w-0 bg-slate-50/50">
          {/* Sticky Toolbar */}
          <header className="sticky top-0 bg-white/95 backdrop-blur-xl z-30 border-b border-slate-100 px-8 py-5 flex flex-col lg:flex-row justify-between items-center gap-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-[#1965e1] rounded-full animate-pulse" />
              <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-[15px]">
                {total} <span className="text-slate-900">Items Found</span>
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sort</span>
                <select
                  className="bg-slate-100 border-none ring-1 ring-slate-200/50 rounded-xl py-2 px-4 focus:ring-2 focus:ring-[#1965e1] text-[10px] font-black outline-none cursor-pointer hover:ring-slate-300 transition-all uppercase tracking-tighter"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                >
                  <option value="name-asc">Alphabetical A-Z</option>
                  <option value="name-desc">Alphabetical Z-A</option>
                  <option value="price-asc">Price: Lowest first</option>
                  <option value="price-desc">Price: Highest first</option>
                </select>
              </div>

              <div className="h-6 w-px bg-slate-100" />

              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-[#1965e1] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <GridIcon />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-[#1965e1] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <ListIcon />
                </button>
              </div>
            </div>
          </header>

          <div className="p-8 lg:p-12">
            {loading ? (
              /* Skeleton Loader */
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10' : 'flex flex-col gap-6'}>
                {[...Array(pageSize)].map((_, i) => (
                  <div key={i} className={`bg-white border border-slate-100 rounded-3xl animate-pulse overflow-hidden ${viewMode === 'grid' ? 'flex flex-col' : 'flex flex-row p-6 gap-6'}`}>
                    <div className={`${viewMode === 'grid' ? 'w-full aspect-square' : 'w-40 h-40'} bg-slate-100`} />
                    <div className="p-8 space-y-4 flex-1">
                      <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                      <div className="h-4 bg-slate-100 rounded-full w-1/2" />
                      <div className="h-8 bg-slate-100 rounded-2xl w-1/3 mt-8" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                {/* Product Grid/List View */}
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10' : 'flex flex-col gap-8'}>
                  {filteredProducts.map((product) => {
                    const tags = product.description?.split(' ').slice(0, 3).filter(t => t.length > 3) || [];

                    return (
                      <div
                        key={product.slug}
                        className={`group bg-white border border-slate-200/60 transition-all duration-700 hover:shadow-[0_40px_80px_-15px_rgba(15,23,42,0.1)] hover:-translate-y-3 flex flex-col rounded-[2.5rem] overflow-hidden relative ${viewMode === 'list' ? 'md:flex-row items-center p-6 gap-10' : ''
                          }`}
                      >
                        {/* Image Section */}
                        <Link
                          href={`/products/${product.slug.toLowerCase().replace(/\s+/g, '-')}`}
                          className={`${viewMode === 'grid' ? 'w-full aspect-square' : 'w-56 h-56 shrink-0'} bg-white p-10 relative flex items-center justify-center overflow-hidden`}
                        >
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-100 font-black text-4xl uppercase italic tracking-tighter opacity-50">SKATE</div>
                          )}

                        </Link>

                        {/* Content Section */}
                        <div className="p-8 pt-0 flex-1 flex flex-col">
                          <Link href={`/products/${product.slug.toLowerCase().replace(/\s+/g, '-')}`}>
                            <h3 className="text-xl font-black text-slate-900 group-hover:text-[#1965e1] transition-colors line-clamp-2 uppercase tracking-tighter leading-none mb-3">
                              {product.name}
                            </h3>
                          </Link>

                          <div className="flex items-baseline gap-2 mt-auto">
                            <span className="text-[#1965e1] font-black text-3xl tracking-tighter italic">
                              ${product.price?.toLocaleString()}
                            </span>
                          </div>

                          {viewMode === 'list' && product.description && (
                            <p className="text-slate-500 text-sm mt-6 line-clamp-3 leading-relaxed font-medium">{product.description}</p>
                          )}

                          <div className="mt-8 flex flex-col gap-3">
                            <SkateAddToCartButton
                              product={{
                                id: product.slug,
                                name: product.name,
                                price: product.price || 0,
                                imageUrl: product.image
                              }}
                              className="w-full cursor-pointer tracking-[0.2em] rounded-2xl shadow-2xl shadow-slate-200 transition-all active:scale-95 group-hover:shadow-[#1965e1]/20"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Modern Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-24 pb-12">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-14 h-14 flex items-center justify-center bg-white border-2 border-slate-100 rounded-[1.5rem] hover:border-slate-900 disabled:opacity-20 transition-all group active:scale-90"
                    >
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" className=""><path d="M15 18l-6-6 6-6" /></svg>
                    </button>

                    <div className="flex items-center gap-3 bg-white p-2 rounded-[1.8rem] border border-slate-100 shadow-sm">
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        if (totalPages <= 5 || pageNum === 1 || pageNum === totalPages || (pageNum >= page - 1 && pageNum <= page + 1)) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`w-12 h-12 flex items-center justify-center text-xs font-black rounded-[1.3rem] transition-all duration-500 ${page === pageNum
                                ? 'bg-[#1965e1] text-white shadow-xl shadow-[#1965e1]/20 scale-110'
                                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (pageNum === page - 2 || pageNum === page + 2) {
                          return <span key={pageNum} className="text-slate-200 font-black">•••</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="w-14 h-14 flex items-center justify-center bg-white border-2 border-slate-100 rounded-[1.5rem] hover:border-slate-900 disabled:opacity-20 transition-all group active:scale-90"
                    >
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" className=""><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Premium Empty State */
              <div className="py-40 flex flex-col items-center justify-center text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(25,101,225,0.03)_0%,transparent_70%)]" />
                <div className="relative z-10">
                  <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl mb-10">
                    <svg width="48" height="48" fill="none" stroke="#1965e1" strokeWidth="2.5"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM22 3L2 3l8 9.46V19l4 2v-8.54L22 3z" /></svg>
                  </div>
                  <h3 className="text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-6">Zero Gear<br /><span className="text-slate-200">Matches</span></h3>
                  <p className="text-slate-400 font-bold max-w-sm px-10 leading-relaxed uppercase text-[15px] tracking-widest">Your current filtering criteria is too strict for our current warehouse stock.</p>
                  <button
                    onClick={clearFilters}
                    className="mt-12 px-12 py-6 bg-[#1965e1] text-white text-[15px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-[#1965e1]/20 hover:bg-slate-900 hover:shadow-slate-200 transition-all active:scale-95"
                  >
                    Reset Inventory View
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[45] md:hidden transition-all duration-500" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  )
}

export default Default
