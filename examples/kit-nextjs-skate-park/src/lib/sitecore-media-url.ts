const DEFAULT_EDGE_MEDIA_BASE_URL =
  'https://edge.sitecorecloud.io/saidigitall7720-saisitecoreff51-devsitecore3e0c-9840';

/**
 * Converts Sitecore CM media URLs used by Search sources into public Edge media
 * URLs. Search extractors can return CM URLs with cache query parameters and
 * HTML-escaped ampersands, neither of which is needed for the Edge media path.
 */
export function normalizeSitecoreMediaUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;

  const rawUrl = value.trim().replace(/&amp;/gi, '&');
  const edgeBaseUrl = (
    process.env.NEXT_PUBLIC_SITECORE_EDGE_MEDIA_BASE_URL || DEFAULT_EDGE_MEDIA_BASE_URL
  ).replace(/\/$/, '');

  try {
    const parsedUrl = new URL(rawUrl, edgeBaseUrl);
    const mediaPath = parsedUrl.pathname.match(/(?:\/-)?\/media\/(.+)$/i);

    if (!mediaPath) return rawUrl;

    const isSitecoreCmUrl =
      /(^|\.)xmc-[^.]+\.sitecorecloud\.io$/i.test(parsedUrl.hostname) ||
      parsedUrl.pathname.toLowerCase().includes('/-/media/');

    if (!isSitecoreCmUrl) return rawUrl;

    // Edge media URLs use /media/... and don't need CM's ttc/tt cache tokens.
    return `${edgeBaseUrl}/media/${mediaPath[1]}`;
  } catch {
    return rawUrl;
  }
}
