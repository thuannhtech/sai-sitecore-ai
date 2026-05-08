import { NextResponse } from 'next/server'
import { getAllProducts, getDynamicProductsRoot } from '../../../lib/products'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') ?? '1')
    const pageSize = Number(searchParams.get('pageSize') ?? '8')
    const q = (searchParams.get('q') ?? '').toLowerCase()
    const sort = searchParams.get('sort') ?? 'name-asc'
    const locale = searchParams.get('locale') ?? 'en'
    const rootPathFromQuery = searchParams.get('rootPath')

    // 1. Get dynamic products root (if not provided by query)
    const rootPath = rootPathFromQuery || await getDynamicProductsRoot(locale);

    // 2. Fetch all products from Sitecore Edge
    const list = await getAllProducts(locale, rootPath);

    let items = list.map(p => ({
      name: p.modelName,
      image: p.imageUrl || '',
      price: p.price,
      description: p.description || '',
      url: `/products/${p.slug}`,
      slug: p.slug
    }))

    // Filter
    if (q) {
      items = items.filter((p) =>
        p.name.toLowerCase().includes(q)
      )
    }

    // Sort
    items.sort((a, b) => {
      const [key, dir] = sort.split('-')
      const mul = dir === 'desc' ? -1 : 1
      if (key === 'price') {
        return (a.price - b.price) * mul
      }
      return a.name.localeCompare(b.name) * mul
    })

    const total = items.length
    const start = (page - 1) * pageSize
    const paged = items.slice(start, start + pageSize)

    return NextResponse.json({ items: paged, total, page, pageSize })
  } catch (e: any) {
    console.error('API Error:', e);
    return NextResponse.json({ error: e?.message ?? 'Unexpected error' }, { status: 500 })
  }
}
