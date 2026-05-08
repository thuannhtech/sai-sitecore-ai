import { ComponentPropsCollection, LayoutServicePageState, Page as SitecorePage } from '@sitecore-content-sdk/nextjs';
import { isDesignLibraryPreviewData } from '@sitecore-content-sdk/nextjs/editing';
import { draftMode } from 'next/headers';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import components from '.sitecore/component-map';
import sites from '.sitecore/sites.json';
import Layout from 'src/Layout';
import Providers from 'src/Providers';
import SkateProductDetail from 'src/components/SkateProductDetail/SkateProductDetail';
import { routing } from 'src/i18n/routing';
import { getAllProductSlugs, getProductBySlug, ProductDetail } from 'src/lib/products';
import client from 'src/lib/sitecore-client';
import scConfig from 'sitecore.config';

export const dynamicParams = true;

const PRODUCTS_ROUTE_SEGMENT = 'products';
const WILDCARD_PRODUCT_SEGMENTS = new Set(['*', '-', '_wildcard_', '-w-']);
const WILDCARD_ITEM_PATHS = ['*', '-', '-w-'];
const PRODUCT_WILDCARD_QUERY = `
  query ProductWildcardLayout($path: String!, $language: String!) {
    item(path: $path, language: $language) {
      rendered
    }
  }
`;

type ProductPageProps = {
  params: Promise<{
    site: string;
    locale: string;
    slug: string;
    [key: string]: string | string[] | undefined;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type WildcardRenderedResponse = {
  item: {
    rendered: SitecorePage['layout'] | null;
  } | null;
};

const mockProduct: ProductDetail = {
  id: 'mock-product-id',
  slug: '*',
  modelName: 'Mock Product (Sitecore Editor)',
  descriptionPlain: 'Mock product for editing the wildcard layout in Sitecore Pages.',
  descriptionHtml: '<p>Mock product for editing the wildcard layout in Sitecore Pages.</p>',
  price: 99.99,
  quantity: 10,
  images: ['https://placehold.co/800x1000/eeeeee/999999?text=Mock+Product'],
};

const normalPageMode: SitecorePage['mode'] = {
  name: LayoutServicePageState.Normal,
  isNormal: true,
  isPreview: false,
  isEditing: false,
  isDesignLibrary: false,
  designLibrary: { isVariantGeneration: false },
};

const buildProductRoutePath = (slug: string) => [PRODUCTS_ROUTE_SEGMENT, slug];

const resolveLocale = (
  pathLocale: string,
  isDraft: boolean,
  editingParams: { [key: string]: string | string[] | undefined }
) => ((isDraft && ((editingParams.sc_lang as string) || (editingParams.language as string))) || pathLocale) as string;

const getProductRouteKind = (slug: string) => WILDCARD_PRODUCT_SEGMENTS.has(slug) ? 'wildcard' : 'detail';

async function resolveProduct(slug: string, locale: string, isDraft: boolean) {
  const product = await getProductBySlug(slug, locale);

  if (product) {
    return product;
  }

  if (isDraft || WILDCARD_PRODUCT_SEGMENTS.has(slug)) {
    return mockProduct;
  }

  return null;
}

async function fetchWildcardProductPage(site: string, locale: string): Promise<SitecorePage | null> {
  for (const wildcardSegment of WILDCARD_ITEM_PATHS) {
    const itemPath = `/sitecore/content/${site}/${site}/Home/${PRODUCTS_ROUTE_SEGMENT}/${wildcardSegment}`;

    try {
      const data = await client.getData<WildcardRenderedResponse>(PRODUCT_WILDCARD_QUERY, {
        path: itemPath,
        language: locale,
      });
      const layout = data?.item?.rendered;

      if (!layout?.sitecore?.route) {
        continue;
      }

      console.log('[ProductPage] wildcard layout resolved', {
        site,
        locale,
        itemPath,
      });

      return {
        layout,
        locale,
        siteName: layout.sitecore.context.site?.name || site,
        mode: normalPageMode,
      };
    } catch (error) {
      console.error('[ProductPage] wildcard item(path) fetch failed', {
        site,
        locale,
        itemPath,
        error,
      });
    }
  }

  return null;
}

async function getResolvedProductPage(
  site: string,
  locale: string,
  slug: string,
  editingParams: { [key: string]: string | string[] | undefined },
  isDraft: boolean
): Promise<SitecorePage | null> {
  if (isDraft) {
    return isDesignLibraryPreviewData(editingParams)
      ? client.getDesignLibraryData(editingParams)
      : client.getPreview(editingParams);
  }

  const routePath = buildProductRoutePath(slug);
  const page = await client.getPage(routePath, { site, locale });

  if (page) {
    console.log('[ProductPage] detail layout resolved via routePath', {
      site,
      locale,
      routePath,
    });
    return page;
  }

  console.warn('[ProductPage] routePath lookup returned null, trying wildcard item fallback', {
    site,
    locale,
    routePath,
  });

  return fetchWildcardProductPage(site, locale);
}

function injectProductIntoPageLayout(
  page: SitecorePage,
  componentProps: ComponentPropsCollection,
  product: ProductDetail
) {
  const placeholders = page.layout.sitecore.route?.placeholders as Record<string, any[]> | undefined;

  if (!placeholders) {
    return;
  }

  const injectIntoPlaceholders = (nestedPlaceholders: Record<string, any[]>) => {
    for (const placeholderName of Object.keys(nestedPlaceholders)) {
      for (const rendering of nestedPlaceholders[placeholderName]) {
        if (rendering.componentName === 'SkateProductDetail') {
          rendering.fields = {
            ...rendering.fields,
            product,
          };

          if (rendering.uid) {
            componentProps[rendering.uid] = {
              ...(componentProps[rendering.uid] as Record<string, unknown>),
              product,
            };
          }
        }

        if (rendering.placeholders) {
          injectIntoPlaceholders(rendering.placeholders);
        }
      }
    }
  };

  injectIntoPlaceholders(placeholders);
}

export async function generateStaticParams(): Promise<{ site: string; locale: string; slug: string }[]> {
  try {
    const defaultSiteName = scConfig.defaultSite || (sites as { name?: string }[])[0]?.name;
    if (!defaultSiteName) {
      console.warn('[generateStaticParams/products] No site name found, skipping static generation.');
      return [];
    }

    const allParams: { site: string; locale: string; slug: string }[] = [];

    for (const locale of routing.locales) {
      try {
        const slugs = await getAllProductSlugs(locale, undefined, 200);
        allParams.push(...slugs.map((slug: string) => ({ site: defaultSiteName, locale, slug })));
      } catch (localeError) {
        console.error(`[generateStaticParams/products] Error fetching slugs for locale ${locale}:`, localeError);
      }
    }

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
  const resolvedParams = await params;
  const editingParams = await searchParams;
  const draft = await draftMode();
  const { site, locale: pathLocale, slug } = resolvedParams;
  const locale = resolveLocale(pathLocale, draft.isEnabled, editingParams);
  const routeKind = getProductRouteKind(slug);

  setRequestLocale(`${site}_${locale}`);

  console.log('[ProductPage] route info', {
    site,
    locale,
    slug,
    routePath: buildProductRoutePath(slug),
    routeKind,
    draftEnabled: draft.isEnabled,
  });

  const [page, messages, product] = await Promise.all([
    getResolvedProductPage(site, locale, slug, editingParams, draft.isEnabled),
    getMessages().catch(() => ({} as Awaited<ReturnType<typeof getMessages>>)),
    resolveProduct(slug, locale, draft.isEnabled),
  ]);

  if (!product) {
    notFound();
  }

  if (!page) {
    return (
      <main className="min-h-screen bg-white">
        <SkateProductDetail product={product} />
      </main>
    );
  }

  const componentProps = await client.getComponentData(page.layout, {}, components);
  injectProductIntoPageLayout(page, componentProps, product);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers page={page} componentProps={componentProps}>
        <Layout page={page} />
      </Providers>
    </NextIntlClientProvider>
  );
}
