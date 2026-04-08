import { NextResponse } from 'next/server'

// Map DummyJSON product shape → normalised product
function extractProduct(raw: any) {
  return {
    name: raw.title ?? '',
    image: raw.thumbnail ?? raw.images?.[0] ?? '',
    price: raw.price ?? null,
    description: raw.description ?? '',
    category: raw.category ?? '',
    brand: raw.brand ?? '',
    rating: raw.rating ?? null,
    stock: raw.stock ?? null,
    url: `https://dummyjson.com/products/${raw.id}`,
  }
}

export const revalidate = 60 // ISR caching for 60s

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') ?? '1')
    const pageSize = Number(searchParams.get('pageSize') ?? '6')
    const q = (searchParams.get('q') ?? '').toLowerCase()
    const sort = searchParams.get('sort') ?? 'name-asc' // name-asc|name-desc|price-asc|price-desc

    // Fetch all products so search / sort work across the full catalogue
    const endpoint = 'https://dummyjson.com/products?limit=0'
    const res = await fetch(endpoint, { next: { revalidate } })
    if (!res.ok) {
      return NextResponse.json({ error: `Upstream returned ${res.status}` }, { status: 502 })
    }

    const data = await res.json()
    const list: any[] = data.products ?? []

    let items = list.map(extractProduct)

    // Filter
    if (q) {
      items = items.filter((p) =>
        [p.name, p.description, p.category, p.brand]
          .some((f) => (f ?? '').toLowerCase().includes(q))
      )
    }

    // Sort
    items.sort((a, b) => {
      const [key, dir] = sort.split('-')
      const mul = dir === 'desc' ? -1 : 1
      if (key === 'price') {
        const ap = a.price ?? Number.MAX_SAFE_INTEGER
        const bp = b.price ?? Number.MAX_SAFE_INTEGER
        return ap === bp ? 0 : ap > bp ? mul : -mul
      }
      // default name
      return a.name.localeCompare(b.name) * mul
    })

    const total = items.length
    const start = (page - 1) * pageSize
    const paged = items.slice(start, start + pageSize)

    return NextResponse.json({ items: paged, total, page, pageSize })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Unexpected error' }, { status: 500 })
  }
}

