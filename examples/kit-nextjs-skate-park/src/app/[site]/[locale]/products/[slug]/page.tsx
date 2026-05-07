import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug } from 'src/lib/products';
import client from "src/lib/sitecore-client";
import Layout, { RouteFields } from "src/Layout";
import { draftMode } from "next/headers";
import { setRequestLocale, getMessages } from "next-intl/server";
import { isDesignLibraryPreviewData } from "@sitecore-content-sdk/nextjs/editing";
import components from ".sitecore/component-map";
import { Page as PageData } from "@sitecore-content-sdk/nextjs";
import { ComponentPropsCollection } from "@sitecore-content-sdk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import Providers from "src/Providers";

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
 * generateMetadata: Dynamic SEO based on product data.
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { site, locale, slug } = await params;

  try {
    /**
     * Fetch parallel for better performance
     */
    const [product, page] = await Promise.all([
      getProductBySlug(slug as string, locale),
      client.getPage(['products', slug as string], { site, locale }),
    ]);

    /**
     * Product not found
     */
    if (!product) {
      return {
        title: "Product Not Found",
        description: "The requested product could not be found.",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    /**
     * Sitecore page title fallback
     */
    const routeFields = page?.layout?.sitecore?.route?.fields as RouteFields;

    const sitecoreTitle =
      routeFields?.Title?.value?.toString() || "Product Details";

    /**
     * SEO data
     */
    const title = `${product.modelName} | ${sitecoreTitle}`;

    const description =
      product.descriptionPlain ||
      `View details and specifications for ${product.modelName}`;

    /**
     * OpenGraph images
     */
    const images = product.images?.filter(Boolean).map((img: string) => ({ url: img })) || [];

    return {
      title,
      description,

      openGraph: {
        title,
        description,
        images,
        locale,
        type: "website",
      },

      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: images.map((img: any) => img?.url || ""),
      },

      alternates: {
        canonical: `/${locale}/products/${slug}`,
      },
    };
  } catch (error) {
    console.error("generateMetadata product error:", error);

    return {
      title: "Product",
      description: "Product page",
    };
  }
}

/**
 * Page Component: Handles data fetching and separation of concerns.
 */
// ... (giữ các import cũ)

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { slug, locale: pathLocale, site } = await params; // Bỏ 'path' vì nó không tồn tại ở segment này
  const editingParams = await searchParams;
  const draft = await draftMode();

  const locale = (draft.isEnabled && (editingParams.sc_lang as string || editingParams.language as string)) || pathLocale;
  setRequestLocale(`${site}_${locale}`);

  /**
   * FIX: Fetch layout của trang products thay vì path động
   * Chúng ta truyền ['products'] để lấy layout của item Wildcard Parent
   */
  const [product, messages, page] = await Promise.all([
    getProductBySlug(slug as string, locale),
    getMessages(),
    draft.isEnabled
      ? (isDesignLibraryPreviewData(editingParams) ? client.getDesignLibraryData(editingParams) : client.getPreview(editingParams))
      : client.getPage(['products', slug as string], { site, locale }), // <--- Ép fetch path /products/*
  ]);

  if (!product) {
    notFound();
  }

  /**
   * SSR DATA INJECTION (Expert Approach):
   * Recursively find the 'SkateProductDetail' rendering and inject data into its fields.
   */
  if (page?.layout?.sitecore?.route) {
    const findAndInject = (placeholders: any) => {
      for (const phName in placeholders) {
        const renderings = placeholders[phName];
        for (const rendering of renderings) {
          if (rendering.componentName === 'SkateProductDetail') {
            // Inject trực tiếp vào fields của rendering
            rendering.fields = {
              ...rendering.fields,
              product: product
            };
            return true;
          }
          if (rendering.placeholders) {
            if (findAndInject(rendering.placeholders)) return true;
          }
        }
      }
      return false;
    };

    findAndInject(page.layout.sitecore.route.placeholders);
  }

  /**
   * Fetch component props - will now include our injected 'product'
   */
  let componentProps: ComponentPropsCollection = {};
  if (page?.layout) {
    componentProps = await client.getComponentData(page.layout, {}, components);
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers 
        page={page as PageData} 
        componentProps={componentProps}
      >
        <Layout page={page as PageData} />
      </Providers>
    </NextIntlClientProvider>
  );
}

