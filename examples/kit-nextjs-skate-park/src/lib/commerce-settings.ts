import client from './sitecore-client';

const COMMERCE_SETTINGS_PATH =
  '/sitecore/content/sai-sitecore/sai-sitecore/Data/Commerce/Settings/New Settings';
const DEFAULT_TAX_RATE = 0.08;

const GET_COMMERCE_SETTINGS = `
  query GetCommerceSettings($path: String!, $language: String!) {
    item(path: $path, language: $language) {
      taxRate: field(name: "GST") { value }
    }
  }
`;

const parseTaxRate = (value: unknown) => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number.parseFloat(normalized.replace('%', ''));
  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed > 1 ? parsed / 100 : parsed;
};

export async function getCommerceTaxRate(language = 'en') {
  try {
    const data = await client.getData<{ item?: Record<string, { value?: string }> }>(
      GET_COMMERCE_SETTINGS,
      {
        path: COMMERCE_SETTINGS_PATH,
        language,
      }
    );

    console.debug('[Sitecore] Fetched commerce settings:', data);

    const item = data?.item;
    const taxRate = parseTaxRate(item?.taxRate?.value) ?? DEFAULT_TAX_RATE;


    return taxRate ?? DEFAULT_TAX_RATE;
  } catch (error) {
    console.error('[Sitecore] Failed to fetch commerce tax rate:', error);
    return DEFAULT_TAX_RATE;
  }
}

export function formatTaxPercentage(rate: number) {
  const percentage = rate * 100;
  return Number.isInteger(percentage) ? `${percentage}%` : `${percentage.toFixed(2)}%`;
}
