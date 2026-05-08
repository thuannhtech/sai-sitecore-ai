import { LayoutServicePageState, Page as SitecorePage } from '@sitecore-content-sdk/nextjs';
import type { SitecoreClient } from '@sitecore-content-sdk/nextjs/client';

const WILDCARD_RENDERED_QUERY = `
  query WildcardRendered($path: String!, $language: String!) {
    item(path: $path, language: $language) {
      rendered
    }
  }
`;

type WildcardRenderedResponse = {
  item: {
    rendered: SitecorePage['layout'] | null;
  } | null;
};

type WildcardPageOptions = {
  site: string;
  locale: string;
  pagePath: string[];
  wildcardRoots?: string[];
};

const DEFAULT_WILDCARD_ROOTS = ['thuan-wildcard-testing', 'products'];

const normalPageMode: SitecorePage['mode'] = {
  name: LayoutServicePageState.Normal,
  isNormal: true,
  isPreview: false,
  isEditing: false,
  isDesignLibrary: false,
  designLibrary: { isVariantGeneration: false },
};

function buildWildcardItemPath(
  site: string,
  pagePath: string[],
  wildcardRoots: string[]
): string | null {
  const wildcardRoot = pagePath[0];

  if (!wildcardRoot || !wildcardRoots.includes(wildcardRoot)) {
    return null;
  }

  return `/sitecore/content/${site}/${site}/Home/${wildcardRoot}/*`;
}

export async function fetchWildcardPage(
  client: SitecoreClient,
  { site, locale, pagePath, wildcardRoots = DEFAULT_WILDCARD_ROOTS }: WildcardPageOptions
): Promise<SitecorePage | null> {
  const itemPath = buildWildcardItemPath(site, pagePath, wildcardRoots);

  if (!itemPath) {
    return null;
  }

  try {
    const data = await client.getData<WildcardRenderedResponse>(WILDCARD_RENDERED_QUERY, {
      path: itemPath,
      language: locale,
    });

    const layout = data?.item?.rendered;
    if (!layout?.sitecore?.route) {
      return null;
    }

    return {
      layout,
      locale,
      siteName: layout.sitecore.context.site?.name || site,
      mode: normalPageMode,
    };
  } catch (error) {
    console.error(`[WildcardResolver] Failed to resolve wildcard item "${itemPath}":`, error);
    return null;
  }
}

export async function getPageWithWildcardFallback(
  client: SitecoreClient,
  options: WildcardPageOptions
): Promise<SitecorePage | null> {
  const page = await client.getPage(options.pagePath, {
    site: options.site,
    locale: options.locale,
  });

  if (page) {
    return page;
  }

  return fetchWildcardPage(client, options);
}
