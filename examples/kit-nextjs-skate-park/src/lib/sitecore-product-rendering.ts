import type { ComponentPropsCollection, Page } from '@sitecore-content-sdk/nextjs';
import { getProductBySlug, type ProductDetail } from 'src/lib/products';

const PRODUCT_ROUTE_SEGMENT = 'products';
const PRODUCT_RENDERING_NAME = 'SkateProductDetail';
const WILDCARD_SLUGS = new Set(['-', '*', '_wildcard_']);

const MOCK_PRODUCT: ProductDetail = {
  id: 'mock-product-id',
  slug: 'mock-product',
  modelName: 'Mock Product (Sitecore Editor)',
  descriptionPlain: 'Mock product for editing the wildcard layout in Sitecore Pages.',
  descriptionHtml: '<p>Mock product for editing the wildcard layout in Sitecore Pages.</p>',
  price: 99.99,
  quantity: 10,
  images: ['https://placehold.co/800x1000/eeeeee/999999?text=Mock+Product'],
};

function hasProductDetailRendering(placeholders: Record<string, any[]> | undefined): boolean {
  if (!placeholders) {
    return false;
  }

  for (const placeholderName in placeholders) {
    for (const rendering of placeholders[placeholderName]) {
      if (rendering.componentName === PRODUCT_RENDERING_NAME) {
        return true;
      }

      if (hasProductDetailRendering(rendering.placeholders)) {
        return true;
      }
    }
  }

  return false;
}

function injectProductIntoPlaceholders(
  placeholders: Record<string, any[]>,
  componentProps: ComponentPropsCollection,
  product: ProductDetail
) {
  for (const placeholderName in placeholders) {
    placeholders[placeholderName].forEach((rendering: any) => {
      if (rendering.componentName === PRODUCT_RENDERING_NAME) {
        rendering.fields = {
          ...rendering.fields,
          product,
        };

        if (rendering.uid) {
          componentProps[rendering.uid] = {
            ...(componentProps[rendering.uid] as object),
            product,
          };
        }
      }

      if (rendering.placeholders) {
        injectProductIntoPlaceholders(rendering.placeholders, componentProps, product);
      }
    });
  }
}

async function resolveProductForPage(
  pagePath: string[],
  locale: string,
  isDraft: boolean
): Promise<ProductDetail | null> {
  if (pagePath[0] !== PRODUCT_ROUTE_SEGMENT) {
    return null;
  }

  const slug = pagePath[1];
  const product = await getProductBySlug(slug, locale);

  if (product) {
    return product;
  }

  if (isDraft || (slug && WILDCARD_SLUGS.has(slug))) {
    return MOCK_PRODUCT;
  }

  return null;
}

export async function enrichProductRenderingData(
  page: Page,
  componentProps: ComponentPropsCollection,
  pagePath: string[],
  locale: string,
  isDraft: boolean
): Promise<ProductDetail | null> {
  const placeholders = page.layout.sitecore.route?.placeholders;

  if (!hasProductDetailRendering(placeholders)) {
    return null;
  }

  const product = await resolveProductForPage(pagePath, locale, isDraft);
  if (!product || !placeholders) {
    return product;
  }

  injectProductIntoPlaceholders(placeholders, componentProps, product);
  return product;
}
