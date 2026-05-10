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
  ordercloud: {
    clientId: process.env.NEXT_PUBLIC_ORDERCLOUD_CLIENT_ID,
    clientSecret: process.env.ORDERCLOUD_CLIENT_SECRET, // ⚠️ Keep this server-side only
    username: process.env.ORDERCLOUD_USERNAME,
    password: process.env.ORDERCLOUD_PASSWORD,
    buyerId: process.env.ORDERCLOUD_BUYER_ID,
    baseApiUrl: process.env.NEXT_PUBLIC_ORDERCLOUD_BASE_API_URL || 'https://australiaeast-sandbox.ordercloud.io',
  },
};

// Server-side validation to prevent runtime errors for missing critical secrets
if (typeof window === 'undefined') {
  const missingSecrets = [];
  
  if (!config.ordercloud.clientSecret) missingSecrets.push('ORDERCLOUD_CLIENT_SECRET');
  if (!config.sitecore.editingSecret) missingSecrets.push('SITECORE_EDITING_SECRET');
  
  if (missingSecrets.length > 0) {
    console.warn(`[Config] ⚠️ Missing server-side secrets: ${missingSecrets.join(', ')}`);
  }
}

export default config;
