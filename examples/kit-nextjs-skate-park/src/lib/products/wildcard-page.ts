import { ComponentPropsCollection, Page } from '@sitecore-content-sdk/nextjs';
import { ProductDetail, getProductBySlug } from 'src/lib/products';

const PRODUCT_ROUTE_SEGMENT = 'products';
const WILDCARD_EDITOR_SEGMENTS = new Set(['*', '-', '_wildcard_', '-w-']);

export type ProductRouteInfo = {
  slug: string;
  sitecorePath: string[];
  usesWildcardPlaceholder: boolean;
};

function createEditorMockProduct(): ProductDetail {
  return {
    id: 'mock-product-id',
    slug: '*',
    modelName: 'Mock Product (Sitecore Editor)',
    descriptionPlain: 'Day la product gia lap de ban co the edit layout trong Sitecore Pages.',
    descriptionHtml: '<p>Day la product gia lap de ban co the edit layout trong Sitecore Pages.</p>',
    price: 99.99,
    quantity: 10,
    images: ['https://placehold.co/800x1000/eeeeee/999999?text=Mock+Product'],
    productType: 'Skateboard',
  } as ProductDetail;
}

export function getProductRouteInfo(path?: string[]): ProductRouteInfo | null {
  if (!path || path.length !== 2) {
    return null;
  }

  const [section, slug] = path;
  if (section?.toLowerCase() !== PRODUCT_ROUTE_SEGMENT || !slug) {
    return null;
  }

  return {
    slug,
    sitecorePath: [PRODUCT_ROUTE_SEGMENT, slug],
    usesWildcardPlaceholder: WILDCARD_EDITOR_SEGMENTS.has(slug),
  };
}

export async function resolveProductFromRoute(
  productRoute: ProductRouteInfo | null,
  locale: string,
  draftEnabled: boolean
) {
  if (!productRoute) {
    return null;
  }

  const product = await getProductBySlug(productRoute.slug, locale);
  if (product) {
    return product;
  }

  if (draftEnabled || productRoute.usesWildcardPlaceholder) {
    return createEditorMockProduct();
  }

  return null;
}

export function injectProductIntoPageLayout(
  page: Page,
  componentProps: ComponentPropsCollection,
  product: ProductDetail | null
) {
  if (!product || !page.layout?.sitecore?.route?.placeholders) {
    return;
  }

  const injectIntoPlaceholders = (placeholders: Record<string, any[]>) => {
    for (const placeholderName of Object.keys(placeholders)) {
      for (const rendering of placeholders[placeholderName]) {
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

  injectIntoPlaceholders(page.layout.sitecore.route.placeholders as Record<string, any[]>);
}
