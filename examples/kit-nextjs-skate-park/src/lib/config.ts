/**
 * Centralized configuration manager for the application.
 * Groups environment variables and provides a typed interface.
 */
export const config = {
  sitecore: {
    edgeContextId: process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID || process.env.SITECORE_EDGE_CONTEXT_ID,
    editingSecret: process.env.SITECORE_EDITING_SECRET,
    defaultSiteName: process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME || 'sai-sitecore',
  },
  sitecoreSearch: {
    env: process.env.NEXT_PUBLIC_SITECORE_SEARCH_ENV,
    customerKey: process.env.NEXT_PUBLIC_SITECORE_SEARCH_CUSTOMER_KEY,
    serviceHost: process.env.NEXT_PUBLIC_SITECORE_SEARCH_SERVICE_HOST,
    apiKey: process.env.NEXT_PUBLIC_SITECORE_SEARCH_API_KEY,
    publicSuffix: process.env.NEXT_PUBLIC_SITECORE_SEARCH_PUBLIC_SUFFIX === 'true',
    trackConsent: process.env.NEXT_PUBLIC_SITECORE_SEARCH_TRACK_CONSENT !== 'false',
  },
  ordercloud: {
    storeFrontClientId: process.env.NEXT_PUBLIC_ORDERCLOUD_CLIENT_ID_HK,
    adminClientId: process.env.NEXT_PUBLIC_ORDERCLOUD_CLIENT_ID,
    adminClientSecret: process.env.ORDERCLOUD_CLIENT_SECRET, // ⚠️ Keep this server-side only
    anonClientId: process.env.NEXT_PUBLIC_ORDERCLOUD_CLIENT_ID_ANNO,
    anonClientSecret: process.env.NEXT_PUBLIC_ORDERCLOUD_CLIENT_SECRET_ANNO, // Can be public for anon access
    username: process.env.ORDERCLOUD_USERNAME,
    password: process.env.ORDERCLOUD_PASSWORD,
    buyerId: process.env.ORDERCLOUD_BUYER_ID,
    baseApiUrl: process.env.NEXT_PUBLIC_ORDERCLOUD_BASE_API_URL || 'https://australiaeast-sandbox.ordercloud.io',
  },
  workato: {
    processOrderUrl: process.env.WORKATO_PROCESS_ORDER_URL,
    processActivationEmailUrl: process.env.WORKATO_PROCESS_ACTIVATION_EMAIL_URL,
    apiToken: process.env.WORKATO_API_TOKEN,
  },
};

// Server-side validation to prevent runtime errors for missing critical secrets
if (typeof window === 'undefined') {
  const missingSecrets = [];

  if (!config.ordercloud.adminClientSecret) missingSecrets.push('ORDERCLOUD_CLIENT_SECRET');
  if (!config.sitecore.editingSecret) missingSecrets.push('SITECORE_EDITING_SECRET');

  if (missingSecrets.length > 0) {
    console.warn(`[Config] ⚠️ Missing server-side secrets: ${missingSecrets.join(', ')}`);
  }
}

export default config;
