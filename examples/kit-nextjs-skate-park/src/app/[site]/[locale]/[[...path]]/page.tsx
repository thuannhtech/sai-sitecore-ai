import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import Layout, { RouteFields } from 'src/Layout';
import components from '.sitecore/component-map';
import Providers from 'src/Providers';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';
import client from 'src/lib/sitecore-client';
import {
  getAllowedSiteNames,
  getStaticLocales,
  loadSitecoreRoutePage,
  resolveRouteLocale,
} from 'src/lib/sitecore/app-router';
import {
  getProductRouteInfo,
  injectProductIntoPageLayout,
  resolveProductFromRoute,
} from 'src/lib/products/wildcard-page';
import { getProductBySlug } from 'src/lib/products';
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

export default async function Page({ params, searchParams }: PageProps) {
  const { site, locale: pathLocale, path } = await params;
  const editingParams = await searchParams;
  const draft = await draftMode();
  const locale = resolveRouteLocale(pathLocale, editingParams, draft.isEnabled);
  const productRoute = getProductRouteInfo(path);

  setRequestLocale(`${site}_${locale}`);

  const [page, messages, product] = await Promise.all([
    loadSitecoreRoutePage({
      draftEnabled: draft.isEnabled,
      editingParams,
      locale,
      path,
      site,
    }),
    getMessages(),
    resolveProductFromRoute(productRoute, locale, draft.isEnabled),
  ]);

  if (!page) {
    notFound();
  }

  if (productRoute && !product) {
    notFound();
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

// This function gets called at build and export time to determine
// pages for SSG ("paths", as tokenized array).
export const generateStaticParams = async () => {
  if (process.env.NODE_ENV !== "development" && scConfig.generateStaticPaths) {
    return await client.getAppRouterStaticParams(
      getAllowedSiteNames(),
      getStaticLocales()
    );
  }

  return [];
};

export const generateMetadata = async ({ params }: PageProps) => {
  const { path, site, locale } = await params;
  const productRoute = getProductRouteInfo(path);

  if (productRoute) {
    const product = await getProductBySlug(productRoute.slug, locale);

    if (product) {
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
  }

  const page = await client.getPage(path ?? [], { site, locale });
  return {
    title:
      (
        page?.layout.sitecore.route?.fields as RouteFields
      )?.Title?.value?.toString() || "Page",
  };
};
