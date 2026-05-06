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
import { routing } from "src/i18n/routing";
import scConfig from "sitecore.config";
import sites from ".sitecore/sites.json";

// 1. ISR: Revalidate every 60 seconds
export const revalidate = 60;

// Allow dynamic rendering for paths not pre-generated (e.g. new products added after build)
export const dynamicParams = true;

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
 * generateStaticParams: Cần trả về ĐẦY ĐỦ { site, locale, slug } cho route [site]/[locale]/products/[slug].
 * Vì [site]/layout.tsx không có generateStaticParams, Next.js không tự propagate site/locale
 * xuống cho trang con. Ta phải tự resolve tất cả các tham số dynamic.
 */
export async function generateStaticParams(): Promise<{ site: string; locale: string; slug: string }[]> {
  try {
    // Lấy tên site mặc định từ config hoặc sites.json
    const defaultSiteName = scConfig.defaultSite || (sites as any[])[0]?.name;
    if (!defaultSiteName) {
      console.warn('[generateStaticParams/products] No site name found, skipping static generation.');
      return [];
    }

    const locales = routing.locales.slice();
    const allParams: { site: string; locale: string; slug: string }[] = [];

    for (const locale of locales) {
      try {
        const slugs = await getAllProductSlugs(locale, undefined, 200);
        for (const slug of slugs) {
          allParams.push({ site: defaultSiteName, locale, slug });
        }
      } catch (localeError) {
        console.error(`[generateStaticParams/products] Error fetching slugs for locale ${locale}:`, localeError);
      }
    }

    console.log(`[generateStaticParams/products] Generated ${allParams.length} static product paths.`);
    return allParams;
  } catch (error) {
    console.error('[generateStaticParams/products] Fatal error, returning empty:', error);
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
  // Dùng try-catch vì client.getPage() có thể THROW (không chỉ return null)
  // khi Sitecore API không khả dụng → gây ra 500 nếu không bắt.
  let page: Awaited<ReturnType<typeof client.getPage>> | null = null;
  let messages: Awaited<ReturnType<typeof getMessages>>;

  try {
    const results = await Promise.all([
      draft.isEnabled
        ? isDesignLibraryPreviewData(editingParams)
          ? client.getDesignLibraryData(editingParams)
          : client.getPreview(editingParams)
        : client.getPage(['products', '-'], { site, locale }),
      getMessages(),
    ]);
    page = results[0];
    messages = results[1];
  } catch (layoutError) {
    console.error('[ProductPage] Failed to fetch Sitecore layout, falling back to pure render:', layoutError);
    // Lấy messages riêng nếu layout fetch thất bại
    try {
      messages = await getMessages();
    } catch {
      messages = {} as any;
    }
    // Fallback: render pure component khi layout không available
    return (
      <main className="min-h-screen bg-white">
        <SkateProductDetail product={product} />
      </main>
    );
  }

  if (!page) {
    // Fallback: render pure component nếu layout trả về null
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
