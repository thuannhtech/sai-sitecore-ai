import { NextResponse } from 'next/server';
import { getProductBySlug } from 'src/lib/products';

export const revalidate = 60;

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(req: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get('locale') ?? 'en';
    const product = await getProductBySlug(slug, locale);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product detail API error:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 }
    );
  }
}
