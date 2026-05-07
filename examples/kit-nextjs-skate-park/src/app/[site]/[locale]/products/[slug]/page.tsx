import { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { isDesignLibraryPreviewData } from '@sitecore-content-sdk/nextjs/editing';
import { ComponentPropsCollection, Page as PageData } from '@sitecore-content-sdk/nextjs';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import components from '.sitecore/component-map';
import Layout, { RouteFields } from 'src/Layout';
import Providers from 'src/Providers';
import client from 'src/lib/sitecore-client';

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

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { site, locale, slug } = await params;

  try {
    const page = await client.getPage(['products', slug as string], { site, locale });
    const routeFields = page?.layout?.sitecore?.route?.fields as RouteFields;
    const sitecoreTitle = routeFields?.Title?.value?.toString() || 'Product Details';

    return {
      title: `${sitecoreTitle} | ${slug}`,
      description: `Product details for ${slug}`,
      alternates: {
        canonical: `/${locale}/products/${slug}`,
      },
    };
  } catch (error) {
    console.error('generateMetadata product error:', error);

    return {
      title: 'Product',
      description: 'Product page',
    };
  }
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { slug, locale: pathLocale, site } = await params;
  const editingParams = await searchParams;
  const draft = await draftMode();

  const locale =
    (draft.isEnabled &&
      ((editingParams.sc_lang as string) || (editingParams.language as string))) ||
    pathLocale;

  setRequestLocale(`${site}_${locale}`);

  const [messages, page] = await Promise.all([
    getMessages(),
    draft.isEnabled
      ? isDesignLibraryPreviewData(editingParams)
        ? client.getDesignLibraryData(editingParams)
        : client.getPreview(editingParams)
      : client.getPage(['products', slug as string], { site, locale }),
  ]);

  if (page?.layout?.sitecore?.route) {
    const findAndInject = (placeholders: Record<string, any[]>) => {
      for (const phName in placeholders) {
        const renderings = placeholders[phName];
        for (const rendering of renderings) {
          if (rendering.componentName === 'SkateProductDetail') {
            rendering.fields = {
              ...rendering.fields,
              product: {
                id: 'debug-static-product',
                slug: slug as string,
                modelName: 'Loading product...',
                descriptionHtml: '<p>Loading product details...</p>',
                descriptionPlain: 'Loading product details...',
                price: 0,
                quantity: 0,
                images: [],
              },
              productSlug: slug as string,
              productLocale: locale,
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

    findAndInject(page.layout.sitecore.route.placeholders);
  }

  let componentProps: ComponentPropsCollection = {};
  if (page?.layout) {
    componentProps = await client.getComponentData(page.layout, {}, components);
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers page={page as PageData} componentProps={componentProps}>
        <Layout page={page as PageData} />
      </Providers>
    </NextIntlClientProvider>
  );
}
