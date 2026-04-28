import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getAllProductSlugs } from 'src/lib/products';
import SkateProductDetail from 'src/components/SkateProductDetail/SkateProductDetail';

// 1. ISR: Revalidate every 60 seconds
export const revalidate = 60;

interface ProductPageProps {
  params: {
    site: string;
    locale: string;
    slug: string;
  };
}

/**
 * generateStaticParams: Fetch all product names from Sitecore to pre-render static pages.
 * Note: In multi-site/multi-locale, you'd iterate over all sites/locales.
 */
export async function generateStaticParams() {
  try {
    const slugs = await getAllProductSlugs();
    // Return slugs. Site and locale can be dynamic at runtime or pre-defined here.
    return slugs.map((slug: any) => ({
      slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

/**
 * generateMetadata: Dynamic SEO based on product data.
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug, locale } = params;
  const product = await getProductBySlug(slug, locale);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.modelName} | SkatePark`,
    description: product.descriptionPlain,
    openGraph: {
      title: product.modelName,
      description: product.descriptionPlain,
      images: product.images.map((img) => ({ url: img })),
    },
  };
}

/**
 * Page Component: Handles data fetching and separation of concerns.
 */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, locale } = params;

  // LOGS FOR VERIFICATION
  console.log('--- PRODUCT PAGE REACHED ---');
  console.log('Slug:', slug);
  console.log('Locale:', locale);
  console.log('Site:', params.site);

  // 2. Data Fetching (Server-side)
  const product = await getProductBySlug(slug, locale);

  // 3. Error Handling: 404 if product doesn't exist
  if (!product) {
    notFound();
  }

  // 4. Render Pure Component
  return (
    <main className="min-h-screen bg-white">
      <SkateProductDetail product={product} />
    </main>
  );
}
