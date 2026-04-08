'use client'

import React from 'react'

/* ── Types ──────────────────────────────────── */
type Product = {
  name: string
  image?: string
  price?: number | null
  description?: string
  url?: string
}

type ApiResponse = {
  items: Product[]
  total: number
  page: number
  pageSize: number
  error?: string
}

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'

const PAGE_SIZE = 6

/* ── Pagination helper ──────────────────────── */
function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]

  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')

  pages.push(total)
  return pages
}

/* ── Arrow SVG ──────────────────────────────── */
const ArrowIcon = ({ direction }: { direction: 'left' | 'right' }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {direction === 'left' ? (
      <polyline points="15 18 9 12 15 6" />
    ) : (
      <polyline points="9 6 15 12 9 18" />
    )}
  </svg>
)

/* ── CTA arrow ──────────────────────────────── */
const CtaArrow = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

/* ── Skeleton cards ─────────────────────────── */
const SkeletonGrid = () => (
  <div className="product-list__grid" aria-hidden="true">
    {Array.from({ length: PAGE_SIZE }).map((_, i) => (
      <div key={i} className="product-list__skeleton" />
    ))}
  </div>
)

/* ── Main Component ─────────────────────────── */
export const Default = () => {
  const [products, setProducts] = React.useState<Product[]>([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [q, setQ] = React.useState('')
  const [debouncedQ, setDebouncedQ] = React.useState('')
  const [sort, setSort] = React.useState<SortOption>('name-asc')
  const [loading, setLoading] = React.useState(true)

  // Debounce search input (350ms)
  React.useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQ(q)
      setPage(1)
    }, 350)
    return () => clearTimeout(id)
  }, [q])

  // Fetch products
  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        q: debouncedQ,
        sort,
      })
      const res = await fetch(`/api/products?${params.toString()}`)
      const data: ApiResponse = await res.json()
      if (data.error) {
        console.error('API error:', data.error)
        setProducts([])
        setTotal(0)
      } else {
        setProducts(data.items)
        setTotal(data.total)
      }
    } catch (err) {
      console.error('Fetch failed:', err)
      setProducts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, debouncedQ, sort])

  React.useEffect(() => {
    load()
  }, [load])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const pageNumbers = buildPageNumbers(page, totalPages)

  return (
    <section className="product-list" id="product-list">
      {/* ── Toolbar ────────────────────────────── */}
      <div className="product-list__toolbar">
        <input
          id="product-search"
          type="search"
          className="product-list__search"
          placeholder="Search products…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search products"
        />

        <label className="product-list__sort-label" htmlFor="product-sort">
          Sort:
          <select
            id="product-sort"
            className="product-list__sort-select"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortOption)
              setPage(1)
            }}
          >
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
            <option value="price-asc">Price low–high</option>
            <option value="price-desc">Price high–low</option>
          </select>
        </label>

        <span className="product-list__count" aria-live="polite">
          {loading ? '…' : `${total} result${total !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* ── Grid / Loading / Empty ─────────────── */}
      {loading ? (
        <SkeletonGrid />
      ) : products.length === 0 ? (
        <div className="product-list__grid">
          <div className="product-list__empty">
            <svg
              className="product-list__empty-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p className="product-list__empty-text">No products found</p>
            <p className="product-list__empty-sub">Try adjusting your search or filters.</p>
          </div>
        </div>
      ) : (
        <div className="product-list__grid">
          {products.map((p, idx) => (
            <article key={`${p.name}-${idx}`} className="product-list__card">
              {p.image && (
                <div className="product-list__card-image-wrapper">
                  <img
                    className="product-list__card-image"
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                  />
                </div>
              )}
              <div className="product-list__card-body">
                <h3 className="product-list__card-name">{p.name}</h3>
                {p.price != null && (
                  <div className="product-list__card-price">
                    ${Number(p.price).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                )}
                {p.description && (
                  <p className="product-list__card-description">{p.description}</p>
                )}
                {p.url && p.url !== '#' && (
                  <a href={p.url} className="product-list__card-cta">
                    View product
                    <CtaArrow />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ── Pagination ─────────────────────────── */}
      {!loading && totalPages > 1 && (
        <nav className="product-list__pagination" aria-label="Product list pagination">
          <button
            className="product-list__pagination-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ArrowIcon direction="left" />
          </button>

          {pageNumbers.map((n, i) =>
            n === '...' ? (
              <span key={`ellipsis-${i}`} className="product-list__pagination-ellipsis">
                …
              </span>
            ) : (
              <button
                key={n}
                className={`product-list__pagination-page${
                  n === page ? ' product-list__pagination-page--active' : ''
                }`}
                onClick={() => setPage(n)}
                aria-current={n === page ? 'page' : undefined}
                aria-label={`Page ${n}`}
              >
                {n}
              </button>
            )
          )}

          <button
            className="product-list__pagination-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            <ArrowIcon direction="right" />
          </button>
        </nav>
      )}
    </section>
  )
}

export default Default