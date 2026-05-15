import client from './sitecore-client';

const DEFAULT_LANGUAGE = process.env.DEFAULT_LANGUAGE || 'en';
const PRODUCTS_ROOT_PATH =
  process.env.SITECORE_PRODUCTS_ROOT_PATH || '{3F757534-28A6-43F3-9DEA-6DF92C6FFCC2}';
const PRODUCTS_PAGE_PATH = '/sitecore/content/sai-sitecore/sai-sitecore/Home/products';

export type ProductCard = {
  id: string;
  slug: string;
  modelName: string;
  price: number;
  imageUrl?: string;
  description?: string;
  orderCloudId?: string;
};

export type ProductDetail = {
  id: string;
  slug: string;
  modelName: string;
  descriptionHtml: string;
  descriptionPlain: string;
  price: number;
  quantity: number;
  images: string[];
  orderCloudId?: string;
  status?: string;
  createdDate?: string;
};

type RawProductItem = {
  id: string;
  name: string;
  modelName?: { value?: string };
  price?: { value?: string };
  description?: { value?: string };
  quantity?: { value?: string };
  orderCloudProductId?: { value?: string };
  images?: {
    jsonValue?: any;
    targetItems?: Array<{
      url?: { path?: string };
    }>;
  };
  createdDate?: { value?: string };
  status?: { value?: string };
};

function extractImageUrls(imagesField?: RawProductItem['images']): string[] {
  if (Array.isArray(imagesField?.jsonValue)) {
    return imagesField.jsonValue.map((img: any) => img?.url).filter(Boolean);
  }

  if (Array.isArray(imagesField?.targetItems) && imagesField.targetItems.length > 0) {
    return imagesField.targetItems.map((target: any) => target?.url?.path).filter(Boolean);
  }

  if (Array.isArray(imagesField?.jsonValue?.value)) {
    return imagesField.jsonValue.value.map((img: any) => img?.src).filter(Boolean);
  }

  return [];
}

async function fetchAllProductsRaw(
  language: string,
  path: string,
  first: number
): Promise<RawProductItem[]> {
  const query = `
    query Products($path: String!, $language: String!, $first: Int) {
      item(path: $path, language: $language) {
        children(first: $first) {
          results {
            id
            name
            modelName: field(name: "ModelName") { value }
            price: field(name: "Price") { value }
            description: field(name: "Description") { value }
            orderCloudProductId: field(name: "OrderCloudProductId") { value }
            images: field(name: "Images") {
              jsonValue
              ... on MultilistField {
                targetItems {
                  url { path }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await client.getData<{ item: any }>(query, { path, language, first });
  return data?.item?.children?.results || [];
}

async function fetchProductBySlugRaw(
  slug: string,
  language: string,
  rootPath: string
): Promise<RawProductItem | null> {
  const spaceNormalizedSlug = slug.replace(/-/g, ' ');
  const query = `
    query Product($parent: String!, $slug: String!, $pattern: String!, $language: String!) {
      search(where: {
        AND: [
          { name: "_parent", value: $parent },
          { name: "_language", value: $language },
          {
            OR: [
              { name: "_name", value: $slug },
              { name: "_name", value: $pattern }
            ]
          }
        ]
      }) {
        results {
          id
          name
          modelName: field(name: "ModelName") { value }
          description: field(name: "Description") { value }
          price: field(name: "Price") { value }
          quantity: field(name: "Quantity") { value }
          orderCloudProductId: field(name: "OrderCloudProductId") { value }
          images: field(name: "Images") {
            jsonValue
            ... on MultilistField {
              targetItems {
                url { path }
              }
            }
          }
          createdDate: field(name: "CreatedDate") { value }
          status: field(name: "Status") { value }
        }
      }
    }
  `;

  const data = await client.getData<{ search: { results: RawProductItem[] } }>(query, {
    parent: rootPath,
    slug,
    pattern: spaceNormalizedSlug,
    language,
  });

  return data?.search?.results?.[0] || null;
}

export async function getDynamicProductsRoot(language = DEFAULT_LANGUAGE): Promise<string> {
  const query = `
    query GetProductsRoot($path: String!, $language: String!) {
      item(path: $path, language: $language) {
        productsRoot: field(name: "ProductsRoot") {
          ... on LookupField {
            targetItem { id path }
          }
          ... on ReferenceField {
            targetItem { id path }
          }
          value
        }
      }
    }
  `;

  try {
    const data = await client.getData<{ item: any }>(query, { path: PRODUCTS_PAGE_PATH, language });
    const field = data?.item?.productsRoot;
    return field?.targetItem?.id || field?.targetItem?.path || field?.value || PRODUCTS_ROOT_PATH;
  } catch (err) {
    console.error('Error fetching dynamic root:', err);
    return PRODUCTS_ROOT_PATH;
  }
}

export async function getAllProducts(
  language = DEFAULT_LANGUAGE,
  path = PRODUCTS_ROOT_PATH,
  first = 100
): Promise<ProductCard[]> {
  const results = await fetchAllProductsRaw(language, path, first);
  const fallbackResults =
    language === DEFAULT_LANGUAGE ? [] : await fetchAllProductsRaw(DEFAULT_LANGUAGE, path, first);
  const fallbackImagesById = new Map(
    fallbackResults.map((item) => [item.id, extractImageUrls(item.images)])
  );

  return results.map((item) => {
    const localizedImages = extractImageUrls(item.images);
    const fallbackImages = fallbackImagesById.get(item.id) || [];
    const imageUrl = localizedImages[0] || fallbackImages[0] || '';

    return {
      id: item.id,
      slug: item.name,
      modelName: item?.modelName?.value || item.name,
      price: item?.price?.value ? parseFloat(item.price.value) : 0,
      description: item?.description?.value
        ? item.description.value.replace(/<[^>]*>/g, ' ').slice(0, 150)
        : '',
      orderCloudId: item?.orderCloudProductId?.value || undefined,
      imageUrl,
    };
  });
}

export async function getProductBySlug(
  slug: string | undefined,
  language = DEFAULT_LANGUAGE,
  rootPath = PRODUCTS_ROOT_PATH
): Promise<ProductDetail | null> {
  if (!slug) return null;

  const decodedSlug = decodeURIComponent(slug);
  const product = await fetchProductBySlugRaw(decodedSlug, language, rootPath);

  if (!product) return null;

  const descHtml = product?.description?.value || '';
  const plain = descHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  let images = extractImageUrls(product.images);

  if (images.length === 0 && language !== DEFAULT_LANGUAGE) {
    const fallbackProduct = await fetchProductBySlugRaw(decodedSlug, DEFAULT_LANGUAGE, rootPath);
    images = extractImageUrls(fallbackProduct?.images);
  }

  return {
    id: product.id,
    slug: product.name,
    modelName: product?.modelName?.value || product.name,
    descriptionHtml: descHtml,
    descriptionPlain: plain,
    price: product?.price?.value ? parseFloat(product.price.value) : 0,
    quantity: product?.quantity?.value ? parseInt(product.quantity.value, 10) : 0,
    images,
    orderCloudId: product?.orderCloudProductId?.value || undefined,
    status: product?.status?.value || '',
    createdDate: product?.createdDate?.value || '',
  };
}

export async function getAllProductSlugs(
  language = DEFAULT_LANGUAGE,
  rootPath = PRODUCTS_ROOT_PATH,
  first = 100
) {
  const query = `
    query Products($path: String!, $language: String!, $first: Int) {
      item(path: $path, language: $language) {
        children(first: $first) {
          results {
            name
          }
        }
      }
    }
  `;

  const data = await client.getData<{ item: any }>(query, { path: rootPath, language, first });
  const results = data?.item?.children?.results || [];
  return results.map((r: any) => r.name);
}
