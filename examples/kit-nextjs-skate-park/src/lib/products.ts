import client from './sitecore-client';

const DEFAULT_LANGUAGE = process.env.DEFAULT_LANGUAGE || 'en';
const PRODUCTS_ROOT_PATH = process.env.SITECORE_PRODUCTS_ROOT_PATH || '{3F757534-28A6-43F3-9DEA-6DF92C6FFCC2}';
const PRODUCTS_PAGE_PATH = '/sitecore/content/sai-sitecore/sai-sitecore/Home/products';

export type ProductCard = {
  id: string;
  slug: string;           // item name
  modelName: string;
  price: number;
  imageUrl?: string;
  description?: string;
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
};

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

export async function getAllProducts(language = DEFAULT_LANGUAGE, path = PRODUCTS_ROOT_PATH): Promise<ProductCard[]> {
  const query = `
    query Products($path: String!, $language: String!) {
      item(path: $path, language: $language) {
        children {
          results {
            id
            name
            modelName: field(name: "ModelName") { value }
            price: field(name: "Price") { value }
            description: field(name: "Description") { value }
            images: field(name: "Images") { jsonValue }
          }
        }
      }
    }
  `;
  const data = await client.getData<{ item: any }>(query, { path, language });
  const results = data?.item?.children?.results || [];
  return results.map((r: any) => ({
    id: r.id,
    slug: r.name,
    modelName: r?.modelName?.value || r.name,
    price: r?.price?.value ? parseFloat(r.price.value) : 0,
    description: r?.description?.value ? r.description.value.replace(/<[^>]*>/g, ' ').slice(0, 150) : '',
    imageUrl: r?.images?.jsonValue?.value?.[0]?.src || '',
  }));
}

export async function getProductBySlug(slug: string | undefined, language = DEFAULT_LANGUAGE, rootPath = PRODUCTS_ROOT_PATH): Promise<ProductDetail | null> {
  
  if (!slug) return null;
  
  // Normalize slug: decode and handle hyphen-to-space conversion for Sitecore item names
  const decodedSlug = decodeURIComponent(slug);
  const spaceNormalizedSlug = decodedSlug.replace(/-/g, ' ');

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
          images: field(name: "Images") { jsonValue }
          oc: field(name: "OrderCloudProductId") { value }
        }
      }
    }
  `;

  const data = await client.getData<{ search: { results: any[] } }>(query, {
    parent: rootPath,
    slug: decodedSlug,
    pattern: spaceNormalizedSlug,
    language
  });

  const i = data?.search?.results?.[0];
  if (!i) return null;
  const descHtml = i?.description?.value || '';
  const plain = descHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  // Map images from jsonValue
  const images = i?.images?.jsonValue?.value?.map((img: any) => img.src) || [];

  return {
    id: i.id,
    slug: i.name,
    modelName: i?.modelName?.value || i.name,
    descriptionHtml: descHtml,
    descriptionPlain: plain,
    price: i?.price?.value ? parseFloat(i.price.value) : 0,
    quantity: i?.quantity?.value ? parseInt(i.quantity.value, 10) : 0,
    images: images,
    orderCloudId: i?.oc?.value || undefined,
  };
}


export async function getAllProductSlugs(language = DEFAULT_LANGUAGE, rootPath = PRODUCTS_ROOT_PATH) {
  const query = `
    query Products($path: String!, $language: String!) {
      item(path: $path, language: $language) {
        children {
          results {
            name
          }
        }
      }
    }
  `;
  const data = await client.getData<{ item: any }>(query, { path: rootPath, language });
  const results = data?.item?.children?.results || [];
  return results.map((r: any) => r.name);
}