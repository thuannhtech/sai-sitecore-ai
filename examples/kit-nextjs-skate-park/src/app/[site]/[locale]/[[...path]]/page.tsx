import { ComponentPropsCollection, Page as PageData, SiteInfo } from '@sitecore-content-sdk/nextjs';
import { isDesignLibraryPreviewData } from '@sitecore-content-sdk/nextjs/editing';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import components from '.sitecore/component-map';
import sites from '.sitecore/sites.json';
import Layout, { RouteFields } from 'src/Layout';
import Providers from 'src/Providers';
import { routing } from 'src/i18n/routing';
import client from 'src/lib/sitecore-client';
import { enrichProductRenderingData } from 'src/lib/sitecore-product-rendering';
import { getPageWithWildcardFallback } from 'src/lib/sitecore-wildcard';
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

type PageWithComponentProps = PageData & {
  componentProps: ComponentPropsCollection;
};

const resolveLocale = (
  pathLocale: string,
  isDraft: boolean,
  editingParams: { [key: string]: string | string[] | undefined }
) => ((isDraft && ((editingParams.sc_lang as string) || (editingParams.language as string))) || pathLocale) as string;

async function getResolvedPage(
  site: string,
  locale: string,
  pagePath: string[],
  editingParams: { [key: string]: string | string[] | undefined },
  isDraft: boolean
) {
  if (isDraft) {
    return isDesignLibraryPreviewData(editingParams)
      ? client.getDesignLibraryData(editingParams)
      : client.getPreview(editingParams);
  }

  return getPageWithWildcardFallback(client, {
    site,
    locale,
    pagePath,
  });
}

export default async function Page({ params, searchParams }: PageProps) {
  const { site, locale: pathLocale, path } = await params;
  const editingParams = await searchParams;
  const draft = await draftMode();
  const locale = resolveLocale(pathLocale, draft.isEnabled, editingParams);
  const pagePath = path ?? [];

  setRequestLocale(`${site}_${locale}`);

  const [page, messages] = await Promise.all([
    getResolvedPage(site, locale, pagePath, editingParams, draft.isEnabled),
    getMessages(),
  ]);

  if (!page) {
    notFound();
  }

  const componentProps = await client.getComponentData(page.layout, {}, components);
  await enrichProductRenderingData(page, componentProps, pagePath, locale, draft.isEnabled);

  const enrichedPage: PageWithComponentProps = {
    ...page,
    componentProps,
  };

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers page={page} componentProps={enrichedPage}>
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
  const pagePath = path ?? [];
  const page = await getPageWithWildcardFallback(client, {
    site,
    locale,
    pagePath,
  });

  return {
    title: (page?.layout.sitecore.route?.fields as RouteFields)?.Title?.value?.toString() || 'Page',
  };
};
