import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import { getProductBySlug, getAllProductSlugs } from 'src/lib/products';
import SkateProductDetail from 'src/components/SkateProductDetail/SkateProductDetail';
import client from "src/lib/sitecore-client";
import Layout from "src/Layout";
import Providers from "src/Providers";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";
import components from ".sitecore/component-map";
import { isDesignLibraryPreviewData } from "@sitecore-content-sdk/nextjs/editing";

// 1. ISR: Revalidate every 60 seconds
export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{
    site: string;
    locale: string;
    slug: string;
    path?: string[];
    [key: string]: string | string[] | undefined;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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
  const { slug, locale } = await params;
  const product = await getProductBySlug(slug as string, locale);

  console.log("product metadata", product);

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
      images: product.images.map((img: any) => ({ url: img })),
    },
  };
}

/**
 * Page Component: Handles data fetching and separation of concerns.
 */
export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { site, locale, slug } = await params;
  const editingParams = await searchParams;
  const draft = await draftMode();

  setRequestLocale(`${site}_${locale}`);

  // 1. Data Fetching (Server-side)
  let product = await getProductBySlug(slug as string, locale);

  console.log("product detail", product);

  // 2. MOCK PRODUCT cho Sitecore Pages Editor
  // Nếu url slug là wildcard item ('-' hoặc '*') HOẶC đang trong chế độ edit mà không tìm thấy product
  if (!product && (draft.isEnabled || slug === '-' || slug === '*' || slug === '_wildcard_')) {
    product = {
      id: "mock-product-id",
      modelName: 'Mock Product (Sitecore Editor)',
      descriptionPlain: 'Đây là product giả lập để bạn có thể edit layout trong Sitecore Pages.',
      descriptionHtml: '<p>Đây là product giả lập để bạn có thể edit layout trong Sitecore Pages.</p>',
      price: 99.99,
      quantity: 10,
      images: ['https://placehold.co/800x1000/eeeeee/999999?text=Mock+Product'],
      productType: "Skateboard",
    } as any;
  }

  // 3. Error Handling: 404 if product doesn't exist
  if (!product) {
    notFound();
  }

  // 4. Fetch Layout Data từ Sitecore JSS (Hỗ trợ Preview Mode trong Sitecore Pages)
  const [page, messages] = await Promise.all([
    draft.isEnabled
      ? isDesignLibraryPreviewData(editingParams)
        ? client.getDesignLibraryData(editingParams)
        : client.getPreview(editingParams)
      : client.getPage(['products', '-'], { site, locale }), // Ở môi trường Live, gọi layout wildcard
    getMessages(),
  ]);

  if (!page) {
    // Fallback: render pure component nếu mất kết nối layout
    return (
      <main className="min-h-screen bg-white">
        <SkateProductDetail product={product} />
      </main>
    );
  }

  // 5. Inject product data vào Sitecore Layout để component SkateProductDetail có thể nhận được
  const componentProps = await client.getComponentData(page.layout, {}, components);

  const injectProductIntoComponentProps = (placeholders: any) => {
    for (const ph in placeholders) {
      placeholders[ph].forEach((rendering: any) => {
        if (rendering.componentName === 'SkateProductDetail') {
          // Inject into fields since AppPlaceholder guarantees fields are passed to Server Components
          rendering.fields = {
            ...rendering.fields,
            product: product
          };

          if (rendering.uid) {
            componentProps[rendering.uid] = {
              ...componentProps[rendering.uid] as any,
              product: product
            };
          }
        }
        if (rendering.placeholders) {
          injectProductIntoComponentProps(rendering.placeholders);
        }
      });
    }
  };

  if (page.layout?.sitecore?.route?.placeholders) {
    injectProductIntoComponentProps(page.layout.sitecore.route.placeholders);
  }

  // 6. Render Sitecore Layout
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers page={page} componentProps={componentProps}>
        <Layout page={page} />
      </Providers>
    </NextIntlClientProvider>
  );
}
