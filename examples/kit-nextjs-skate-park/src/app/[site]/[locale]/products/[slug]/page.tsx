import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import { LayoutServicePageState, Page as SitecorePage } from '@sitecore-content-sdk/nextjs';
import { isDesignLibraryPreviewData } from '@sitecore-content-sdk/nextjs/editing';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import components from '.sitecore/component-map';
import sites from '.sitecore/sites.json';
import Layout from 'src/Layout';
import Providers from 'src/Providers';
import SkateProductDetail from 'src/components/SkateProductDetail/SkateProductDetail';
import { routing } from 'src/i18n/routing';
import { getAllProductSlugs, getProductBySlug } from 'src/lib/products';
import client from 'src/lib/sitecore-client';
import scConfig from 'sitecore.config';

export const revalidate = 60;
export const dynamicParams = true;

const PRODUCTS_ROUTE_SEGMENT = 'products';

type ProductPageProps = {
  params: Promise<{
    site: string;
    locale: string;
    slug: string;
    path?: string[];
    [key: string]: string | string[] | undefined;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type WildcardRenderedResponse = {
  item: {
    rendered: SitecorePage['layout'] | null;
  } | null;
};

const buildProductsWildcardItemPaths = (site: string) => [
  `/sitecore/content/${site}/${site}/Home/${PRODUCTS_ROUTE_SEGMENT}/*`,
  `/sitecore/content/${site}/${site}/Home/${PRODUCTS_ROUTE_SEGMENT}/-`,
];

const normalPageMode: SitecorePage['mode'] = {
  name: LayoutServicePageState.Normal,
  isNormal: true,
  isPreview: false,
  isEditing: false,
  isDesignLibrary: false,
  designLibrary: { isVariantGeneration: false },
};

async function fetchWildcardPageLayout(site: string, locale: string): Promise<SitecorePage | null> {
  const query = `
    query ProductWildcardLayout($path: String!, $language: String!) {
      item(path: $path, language: $language) {
        rendered
      }
    }
  `;

  for (const itemPath of buildProductsWildcardItemPaths(site)) {
    try {
      const data = await client.getData<WildcardRenderedResponse>(query, {
        path: itemPath,
        language: locale,
      });
      const layout = data?.item?.rendered;

      if (layout?.sitecore?.route) {
        console.log(
          `[ProductPage] Wildcard layout resolved via item(path) at ${itemPath} (site=${site}, locale=${locale})`
        );

        return {
          layout,
          locale,
          siteName: layout.sitecore.context.site?.name || site,
          mode: normalPageMode,
        };
      }

      console.warn(
        `[ProductPage] Wildcard item(path) returned no route at ${itemPath} (site=${site}, locale=${locale})`
      );
    } catch (error) {
      console.error(`[ProductPage] Wildcard item(path) fetch failed at ${itemPath}:`, error);
    }
  }

  return null;
}

export async function generateStaticParams(): Promise<{ site: string; locale: string; slug: string }[]> {
  try {
    const defaultSiteName = scConfig.defaultSite || (sites as { name?: string }[])[0]?.name;
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

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
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
      images: product.images.map((img: string) => ({ url: img })),
    },
  };
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { site, locale, slug } = await params;
  const editingParams = await searchParams;
  const draft = await draftMode();

  setRequestLocale(`${site}_${locale}`);

  let product = await getProductBySlug(slug, locale);

  if (!product && (draft.isEnabled || slug === '-' || slug === '*' || slug === '_wildcard_')) {
    product = {
      id: 'mock-product-id',
      modelName: 'Mock Product (Sitecore Editor)',
      descriptionPlain: 'Mock product for editing the wildcard layout in Sitecore Pages.',
      descriptionHtml: '<p>Mock product for editing the wildcard layout in Sitecore Pages.</p>',
      price: 99.99,
      quantity: 10,
      images: ['https://placehold.co/800x1000/eeeeee/999999?text=Mock+Product'],
      productType: 'Skateboard',
    } as any;
  }

  if (!product) {
    notFound();
  }

  let page: SitecorePage | null = null;
  let messages: Awaited<ReturnType<typeof getMessages>>;

  try {
    messages = await getMessages();
  } catch {
    messages = {} as any;
  }

  if (draft.isEnabled) {
    try {
      page = isDesignLibraryPreviewData(editingParams)
        ? await client.getDesignLibraryData(editingParams)
        : await client.getPreview(editingParams);
    } catch (previewError) {
      console.error('[ProductPage] Preview layout fetch failed:', previewError);
    }
  } else {
    const currentProductRoute = [PRODUCTS_ROUTE_SEGMENT, slug];

    try {
      page = await client.getPage(currentProductRoute, { site, locale });
      if (page) {
        console.log(
          `[ProductPage] Layout resolved via routePath at /${currentProductRoute.join('/')} (site=${site}, locale=${locale})`
        );
      } else {
        console.warn(
          `[ProductPage] routePath lookup returned null at /${currentProductRoute.join('/')} (site=${site}, locale=${locale}). Falling back to wildcard item(path).`
        );
      }
    } catch (routeError) {
      console.error(`[ProductPage] routePath lookup failed at /${currentProductRoute.join('/')}:`, routeError);
    }

    if (!page) {
      page = await fetchWildcardPageLayout(site, locale);
    }

    if (!page) {
      console.error(
        `[ProductPage] Wildcard fallback failed for slug="${slug}", site="${site}", locale="${locale}". Rendering without Sitecore layout.`
      );
    }
  }

  if (!page) {
    return (
      <main className="min-h-screen bg-white">
        <SkateProductDetail product={product} />
      </main>
    );
  }

  const componentProps = await client.getComponentData(page.layout, {}, components);

  const injectProductIntoComponentProps = (placeholders: Record<string, any[]>) => {
    for (const placeholderName in placeholders) {
      placeholders[placeholderName].forEach((rendering: any) => {
        if (rendering.componentName === 'SkateProductDetail') {
          rendering.fields = {
            ...rendering.fields,
            product,
          };

          if (rendering.uid) {
            componentProps[rendering.uid] = {
              ...(componentProps[rendering.uid] as any),
              product,
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

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers page={page} componentProps={componentProps}>
        <Layout page={page} />
      </Providers>
    </NextIntlClientProvider>
  );
}
