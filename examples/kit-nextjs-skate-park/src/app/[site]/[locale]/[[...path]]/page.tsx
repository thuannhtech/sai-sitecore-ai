import { ComponentPropsCollection, Page as PageData } from '@sitecore-content-sdk/nextjs';
import { isDesignLibraryPreviewData } from '@sitecore-content-sdk/nextjs/editing';
import { SiteInfo } from '@sitecore-content-sdk/nextjs';
import { draftMode } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import sites from '.sitecore/sites.json';
import components from '.sitecore/component-map';
import Layout, { RouteFields } from 'src/Layout';
import Providers from 'src/Providers';
import { getProductBySlug } from 'src/lib/products';
import client from 'src/lib/sitecore-client';
import { routing } from 'src/i18n/routing';
import scConfig from 'sitecore.config';

type PageProps = {
  params: Promise<{
    site: string;
    locale: string;
    path?: string[];
    [key: string]: string | string[] | undefined;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const isProductDetailPath = (path?: string[]) =>
  Array.isArray(path) && path.length === 2 && path[0] === 'products' && !!path[1];

const resolveProductWildcardPage = async ({
  path,
  site,
  locale,
}: {
  path?: string[];
  site: string;
  locale: string;
}) => {
  const candidates: string[][] = [];

  if (path?.length) {
    candidates.push(path);
  }

  if (isProductDetailPath(path)) {
    candidates.push(['products', '*']);
    candidates.push(['products']);
  }

  for (const candidate of candidates) {
    try {
      const page = await client.getPage(candidate, { site, locale });
      if (page) {
        return page;
      }
    } catch (error) {
      console.error('Error resolving Sitecore page for candidate path:', candidate, error);
    }
  }

  return null;
};

const injectProductIntoRenderings = ({
  page,
  product,
}: {
  page: PageData;
  product: Awaited<ReturnType<typeof getProductBySlug>>;
}) => {
  const placeholders = page.layout?.sitecore?.route?.placeholders;
  if (!placeholders || !product) {
    return;
  }

  const findAndInject = (currentPlaceholders: Record<string, any[]>) => {
    for (const phName in currentPlaceholders) {
      const renderings = currentPlaceholders[phName];
      for (const rendering of renderings) {
        if (rendering.componentName === 'SkateProductDetail') {
          rendering.fields = {
            ...rendering.fields,
            product,
          };
          return true;
        }

        if (rendering.placeholders && findAndInject(rendering.placeholders)) {
          return true;
        }
      }
    }

    return false;
  };

  findAndInject(placeholders);
};

export default async function Page({ params, searchParams }: PageProps) {
  const { site, locale: pathLocale, path } = await params;
  const editingParams = await searchParams;
  const draft = await draftMode();

  const locale =
    (draft.isEnabled && ((editingParams.sc_lang as string) || (editingParams.language as string))) ||
    pathLocale;

  setRequestLocale(`${site}_${locale}`);

  const isProductPage = isProductDetailPath(path);
  const slug = isProductPage ? path?.[1] : undefined;

  const [page, messages, product] = await Promise.all([
    draft.isEnabled
      ? isDesignLibraryPreviewData(editingParams)
        ? client.getDesignLibraryData(editingParams)
        : client.getPreview(editingParams)
      : resolveProductWildcardPage({ path, site, locale }),
    getMessages(),
    slug ? getProductBySlug(slug, locale) : Promise.resolve(null),
  ]);

  if (!page) {
    notFound();
  }

  if (isProductPage && !product) {
    notFound();
  }

  if (isProductPage && product) {
    injectProductIntoRenderings({ page: page as PageData, product });
  }

  const componentProps = await client.getComponentData(page.layout, {}, components);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers page={page} componentProps={componentProps}>
        <Layout page={page} />
      </Providers>
    </NextIntlClientProvider>
  );
}

export const generateStaticParams = async () => {
  if (process.env.NODE_ENV !== 'development' && scConfig.generateStaticPaths) {
    const defaultSite = scConfig.defaultSite;
    const allowedSites = defaultSite
      ? sites
        .filter((site: SiteInfo) => site.name === defaultSite)
        .map((site: SiteInfo) => site.name)
      : sites.map((site: SiteInfo) => site.name);

    return await client.getAppRouterStaticParams(allowedSites, routing.locales.slice());
  }

  return [];
};

export const generateMetadata = async ({ params }: PageProps) => {
  const { path, site, locale } = await params;

  const page = await resolveProductWildcardPage({ path, site, locale });

  return {
    title:
      ((page?.layout?.sitecore?.route?.fields as RouteFields)?.Title?.value?.toString() as string) ||
      'Page',
  };
};
