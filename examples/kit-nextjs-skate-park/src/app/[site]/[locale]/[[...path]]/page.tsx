import { isDesignLibraryPreviewData } from "@sitecore-content-sdk/nextjs/editing";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { SiteInfo } from "@sitecore-content-sdk/nextjs";
import sites from ".sitecore/sites.json";
import { routing } from "src/i18n/routing";
import scConfig from "sitecore.config";
import client from "src/lib/sitecore-client";
import Layout, { RouteFields } from "src/Layout";
import components from ".sitecore/component-map";
import Providers from "src/Providers";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";
import { ComponentPropsCollection } from "@sitecore-content-sdk/nextjs";
import { Page as PageData } from "@sitecore-content-sdk/nextjs";

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

export default async function Page({ params, searchParams }: PageProps) {
  const { site, locale: pathLocale, path } = await params;
  const editingParams = await searchParams;
  const draft = await draftMode();

  // Resolve the actual locale: prioritize search params in draft mode (Editor), otherwise use path locale
  const locale = (draft.isEnabled && (editingParams.sc_lang as string || editingParams.language as string)) || pathLocale;
  const pagePath = path ?? [];

  // Set site and locale to be available in src/i18n/request.ts for fetching the dictionary
  setRequestLocale(`${site}_${locale}`);

  // Fetch the page data and messages in parallel
  const [page, messages] = await Promise.all([

    draft.isEnabled
      ? isDesignLibraryPreviewData(editingParams)
        ? client.getDesignLibraryData(editingParams)
        : client.getPreview(editingParams)
      : client.getPage(pagePath, { site, locale }),
    getMessages(),

  ]);

  // If the page is not found, return a 404
  if (!page) {
   
    notFound();
  }

  // Fetch the component data from Sitecore (Likely will be deprecated) 
  const componentProps = await client.getComponentData(
    page.layout,
    {},
    components
  );

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

// This function gets called at build and export time to determine
// pages for SSG ("paths", as tokenized array).
export const generateStaticParams = async () => {
  if (process.env.NODE_ENV !== "development" && scConfig.generateStaticPaths) {
    // Filter sites to only include the sites this starter is designed to serve.
    // This prevents cross-site build errors when multiple starters share the same XM Cloud instance.
    const defaultSite = scConfig.defaultSite;
    const allowedSites = defaultSite
      ? sites
        .filter((site: SiteInfo) => site.name === defaultSite)
        .map((site: SiteInfo) => site.name)
      : sites.map((site: SiteInfo) => site.name);

    return await client.getAppRouterStaticParams(
      allowedSites,
      routing.locales.slice()
    );
  }

  return [];
};

// Metadata fields for the page.
export const generateMetadata = async ({ params }: PageProps) => {
  const { path, site, locale } = await params;
  const pagePath = path ?? [];

  // The same call as for rendering the page. Should be cached by default react behavior
  const page = await client.getPage(pagePath, { site, locale });


  return {
    title:
      (
        page?.layout.sitecore.route?.fields as RouteFields
      )?.Title?.value?.toString() || "Page",
  };
};
