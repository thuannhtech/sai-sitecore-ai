import client from './sitecore-client';

export type RecaptchaSiteSettings = {
  siteKey: string;
  secretKey: string;
};

// In-memory cache to prevent spamming Sitecore Edge on every request
const settingsCache = new Map<string, { data: RecaptchaSiteSettings; expiry: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches Google reCAPTCHA keys exclusively from Sitecore Edge for a specific siteName.
 * Path convention: /sitecore/content/{siteName}/{siteName}/Settings/Google reCAPTCHA
 *
 * NOTE: Keys are retrieved solely from this Sitecore item path. No .env.local fallback.
 */
export async function getRecaptchaSettingsForSite(
  siteName: string = 'sai-sitecore'
): Promise<RecaptchaSiteSettings> {
  const cleanSiteName = (siteName || process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME || 'sai-sitecore').trim();
  const cacheKey = cleanSiteName.toLowerCase();

  const cached = settingsCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }

  const itemPath = `/sitecore/content/${cleanSiteName}/${cleanSiteName}/Settings/Google reCAPTCHA`;

  const query = `
    query GetRecaptchaSettings($path: String!) {
      item(path: $path, language: "en") {
        id
        name
        fields(ownFields: false) {
          name
          value
        }
      }
    }
  `;

  try {
    const res: any = await client.getData(query, { path: itemPath });
    const fields: Array<{ name: string; value: string }> = res?.item?.fields || [];

    const siteKeyField = fields.find(
      (f) =>
        f.name.toLowerCase() === 'sitekey' ||
        f.name.toLowerCase() === 'site key' ||
        f.name.toLowerCase() === 'site_key'
    );

    const secretKeyField = fields.find(
      (f) =>
        f.name.toLowerCase() === 'secretkey' ||
        f.name.toLowerCase() === 'secret key' ||
        f.name.toLowerCase() === 'secret_key'
    );

    const siteKey = siteKeyField?.value?.trim() || '';
    const secretKey = secretKeyField?.value?.trim() || '';

    const data: RecaptchaSiteSettings = { siteKey, secretKey };

    // Cache valid result
    settingsCache.set(cacheKey, {
      data,
      expiry: Date.now() + CACHE_TTL_MS,
    });

    return data;
  } catch (err: any) {
    console.error(`[reCAPTCHA Settings] Failed to fetch settings from Sitecore path "${itemPath}":`, err?.message || err);

    return {
      siteKey: '',
      secretKey: '',
    };
  }
}
