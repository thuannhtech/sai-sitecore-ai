import {
  ComponentPropsCollection,
  Page as SitecorePage,
} from "@sitecore-content-sdk/nextjs";
import { isDesignLibraryPreviewData } from "@sitecore-content-sdk/nextjs/editing";
import { draftMode } from "next/headers";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import components from ".sitecore/component-map";
import Layout from "src/Layout";
import Providers from "src/Providers";
import { getProductBySlug, ProductDetail } from "src/lib/products";
import { getServerUser } from "src/lib/ordercloud/server-auth";
import client from "src/lib/sitecore-client";
import { MeUser } from "ordercloud-javascript-sdk";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{
    site: string;
    locale: string;
    slug: string | string[];
    [key: string]: string | string[] | undefined;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const parentWildcardRoute = "products";

const resolveWildCardPath = () => [parentWildcardRoute, ",-w-,"];

const resolveSlug = (slug: string | string[] | undefined): string | undefined =>
  Array.isArray(slug) ? slug.at(-1) : slug;

const injectProductIntoComponentProps = (
  page: SitecorePage,
  componentProps: ComponentPropsCollection,
  product: ProductDetail
) => {
  const injectIntoPlaceholders = (placeholders?: Record<string, any[]>) => {
    if (!placeholders) {
      return;
    }

    for (const renderings of Object.values(placeholders)) {
      for (const rendering of renderings) {
        if (
          rendering.componentName === "SkateProductDetail" &&
          rendering.uid
        ) {
          rendering.fields = {
            ...(rendering.fields as Record<string, unknown> | undefined),
            product,
          };

          componentProps[rendering.uid] = {
            ...(componentProps[rendering.uid] as Record<string, unknown>),
            product,
          };
        }

        if (rendering.placeholders) {
          injectIntoPlaceholders(
            rendering.placeholders as Record<string, any[]>
          );
        }
      }
    }
  };

  injectIntoPlaceholders(
    page.layout.sitecore.route?.placeholders as Record<string, any[]> | undefined
  );
};

const injectUserIntoComponentProps = (
  page: SitecorePage,
  componentProps: ComponentPropsCollection,
  user: MeUser | null
) => {
  const injectIntoPlaceholders = (placeholders?: Record<string, any[]>) => {
    if (!placeholders) {
      return;
    }

    for (const renderings of Object.values(placeholders)) {
      for (const rendering of renderings) {
        if (rendering.componentName === "MenuHeader" && rendering.uid) {
          rendering.fields = {
            ...(rendering.fields as Record<string, unknown> | undefined),
            user,
          };

          componentProps[rendering.uid] = {
            ...(componentProps[rendering.uid] as Record<string, unknown>),
            user,
          };
        }

        if (rendering.placeholders) {
          injectIntoPlaceholders(
            rendering.placeholders as Record<string, any[]>
          );
        }
      }
    }
  };

  injectIntoPlaceholders(
    page.layout.sitecore.route?.placeholders as Record<string, any[]> | undefined
  );
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolveSlug(resolvedParams.slug);
  const product = await getProductBySlug(slug, resolvedParams.locale);
  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.modelName,
    description: product.descriptionPlain,
    openGraph: {
      title: product.modelName,
      description: product.descriptionPlain,
      images: product.images.map((img: string) => ({ url: img })),
    },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const resolvedParams = await params;
  const editingParams = await searchParams;
  const draft = await draftMode();
  const { site, locale: pathLocale, slug: slugParam } = resolvedParams;
  const locale =
    (draft.isEnabled &&
      ((editingParams.sc_lang as string) || (editingParams.language as string))) ||
    pathLocale;
  const slug = resolveSlug(slugParam);

  setRequestLocale(`${site}_${locale}`);

  const [page, messages, product, user] = await Promise.all([
    draft.isEnabled
      ? isDesignLibraryPreviewData(editingParams)
        ? client.getDesignLibraryData(editingParams)
        : client.getPreview(editingParams)
      : client.getPage(resolveWildCardPath(), { site, locale }),
    getMessages(),
    getProductBySlug(slug, locale),
    getServerUser(),
  ]);

  if (!page) {
    notFound();
  }

  const componentProps = await client.getComponentData(page.layout, {}, components);

  if (product) {
    injectProductIntoComponentProps(page, componentProps, product);
  }

  injectUserIntoComponentProps(page, componentProps, user);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers page={page} componentProps={componentProps} user={user}>
        <Layout page={page} />
      </Providers>
    </NextIntlClientProvider>
  );
}
