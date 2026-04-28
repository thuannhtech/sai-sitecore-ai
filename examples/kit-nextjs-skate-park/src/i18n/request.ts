import { getRequestConfig, GetRequestConfigParams } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
import client from 'src/lib/sitecore-client';

export default getRequestConfig(async ({ requestLocale }: GetRequestConfigParams) => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
  // Since this function is executed during the Server Components render pass, you can call functions like cookies() and headers() to return configuration that is request-specific. https://next-intl.dev/docs/usage/configuration

  // set by the catch-all route setRequestLocale
  // to support SSG and multisite here we expect both site and locale in the format {site}_{locale}
  const requested = await requestLocale;
  const [parsedSite, parsedLocale] = requested?.split('_') || [];
  const locale = hasLocale(routing.locales, parsedLocale) ? parsedLocale : routing.defaultLocale;

  const messages: Record<string, object> = {};

  const rawMessages = await client.getDictionary({
    locale,
    site: parsedSite,
  });

  // next-intl does not allow dots in keys (it uses them for nesting).
  // Sitecore dictionary keys often contain dots or special paths like .well-known.
  const sanitizedMessages: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawMessages)) {
    // Replace dots with double underscores to avoid nesting issues in next-intl
    const safeKey = key.replace(/\./g, '__');
    sanitizedMessages[safeKey] = value;
  }

  messages[parsedSite] = sanitizedMessages;

  return {
    locale,
    messages,
  };
});
