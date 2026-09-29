import { type NextRequest, type NextFetchEvent, type NextResponse } from 'next/server';
import {
  defineMiddleware,
  AppRouterMultisiteMiddleware,
  PersonalizeMiddleware,
  type PersonalizeMiddlewareConfig,
  RedirectsMiddleware,
  LocaleMiddleware,
} from '@sitecore-content-sdk/nextjs/middleware';
import { CloudSDK } from '@sitecore-cloudsdk/core/server';
import '@sitecore-cloudsdk/personalize/server';
import sitesData from '.sitecore/sites.json';
import scConfig from 'sitecore.config';
import { routing } from './i18n/routing';

// Step 1: Deduplicate sites by name and ensure each site has entries for all supported locales
const uniqueSiteNames = Array.from(new Set(sitesData.map(s => s.name)));
const sites = uniqueSiteNames.flatMap(siteName => {
  const baseSite = sitesData.find(s => s.name === siteName);
  if (!baseSite) return [];
  return routing.locales.map(lang => ({
    name: baseSite.name,
    hostName: baseSite.hostName,
    language: lang
  }));
});

const locale = new LocaleMiddleware({
  /**
   * List of sites for site resolver to work with
   */
  sites,
  /**
   * List of all supported locales configured in routing.ts
   */
  locales: routing.locales.slice(),
  // This function determines if the middleware should be turned off on per-request basis.
  // Certain paths are ignored by default (e.g. files and Next.js API routes), but you may wish to disable more.
  // This is an important performance consideration since Next.js Edge middleware runs on every request.
  // in multilanguage scenarios, we need locale middleware to always run first to ensure locale is set and used correctly by the rest of the middlewares
  skip: () => false,
});

const multisite = new AppRouterMultisiteMiddleware({
  /**
   * List of sites for site resolver to work with
   */
  sites,
  ...scConfig.api.edge,
  ...scConfig.multisite,
  // This function determines if the middleware should be turned off on per-request basis.
  // Certain paths are ignored by default (e.g. files and Next.js API routes), but you may wish to disable more.
  // This is an important performance consideration since Next.js Edge middleware runs on every request.
  skip: () => false,
});

const redirects = new RedirectsMiddleware({
  /**
   * List of sites for site resolver to work with
   */
  sites,
  ...scConfig.api.edge,
  ...scConfig.api.local,
  ...scConfig.redirects,
  // This function determines if the middleware should be turned off on per-request basis.
  // Certain paths are ignored by default (e.g. Next.js API routes), but you may wish to disable more.
  // By default it is disabled while in development mode.
  // This is an important performance consideration since Next.js Edge middleware runs on every request.
  skip: () => false,
});

/**
 * Custom PersonalizeMiddleware for Next.js App Router.
 * In App Router, the locale is part of the URL pathname (e.g. /en, /en/products, /vi-VN).
 * Standard PersonalizeMiddleware passes the full pathname (including /en) to getPersonalizeInfo,
 * which causes Sitecore Edge to search for an item at routePath "/en" and return null.
 * This class normalizes the pathname by removing the locale prefix before requesting personalize info.
 */
class AppRouterPersonalizeMiddleware extends PersonalizeMiddleware {
  constructor(config: PersonalizeMiddlewareConfig) {
    super(config);
    if (this.personalizeService) {
      const originalGetPersonalizeInfo = this.personalizeService.getPersonalizeInfo.bind(this.personalizeService);
      this.personalizeService.getPersonalizeInfo = async (pathname: string, language: string, siteName: string) => {
        let normalizedPath = pathname.split('?')[0];

        // Strip locale prefix (case-insensitive)
        for (const loc of routing.locales) {
          const lowerPath = normalizedPath.toLowerCase();
          const lowerLoc = loc.toLowerCase();
          if (lowerPath === `/${lowerLoc}` || lowerPath === `/${lowerLoc}/`) {
            normalizedPath = '/';
            break;
          } else if (lowerPath.startsWith(`/${lowerLoc}/`)) {
            normalizedPath = normalizedPath.slice(loc.length + 1);
            break;
          }
        }

        // Remove trailing slash for Sitecore Experience Edge compatibility (except root '/')
        if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
          normalizedPath = normalizedPath.slice(0, -1);
        }

        if (!normalizedPath.startsWith('/')) {
          normalizedPath = `/${normalizedPath}`;
        }

        return originalGetPersonalizeInfo(normalizedPath, language, siteName);
      };
    }
  }

  /**
   * By default, PersonalizeMiddleware skips personalization on Next.js prefetch requests.
   * In App Router, this causes Next.js to prefetch & cache the unpersonalized default variant.
   * Returning false ensures prefetch requests are also personalized, avoiding stale default cache on client navigation.
   */
  protected override isPrefetch(_req: NextRequest): boolean {
    return false;
  }

  /**
   * Fix cookieDomain on localhost/HTTP development so browsers don't reject the bid cookie
   * due to Domain=localhost or SameSite=None; Secure over plain HTTP.
   */
  protected override async initPersonalizeServer({
    hostname,
    siteName,
    request,
    response,
  }: {
    hostname: string;
    siteName: string;
    request: NextRequest;
    response: NextResponse;
  }): Promise<void> {
    const isLocalhost = hostname === 'localhost' || hostname.startsWith('localhost:');
    const cookieDomain = isLocalhost ? undefined : hostname;

    await CloudSDK(request, response, {
      sitecoreEdgeUrl: this.config.edgeUrl,
      sitecoreEdgeContextId: this.config.contextId,
      siteName,
      cookieDomain,
      enableServerCookie: true,
    })
      .addPersonalize({ enablePersonalizeCookie: true })
      .initialize();
  }
}

const personalize = new AppRouterPersonalizeMiddleware({
  /**
   * List of sites for site resolver to work with
   */
  sites,
  ...scConfig.api.edge,
  ...scConfig.personalize,
  // This function determines if the middleware should be turned off on per-request basis.
  // Certain paths are ignored by default (e.g. Next.js API routes), but you may wish to disable more.
  // By default it is disabled while in development mode.
  // This is an important performance consideration since Next.js Edge middleware runs on every request.
  skip: () => false,
});

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  const response = await defineMiddleware(locale, multisite, redirects, personalize).exec(req, ev);
  response.headers.set('x-middleware-cache', 'no-cache');
  return response;
}

export const config = {
  /*
   * Match all paths except for:
   * 1. API route handlers
   * 2. /_next (Next.js internals)
   * 3. /sitecore/api (Sitecore API routes)
   * 4. /- (Sitecore media)
   * 5. /healthz (Health check)
   * 7. all root files inside /public
   */
  matcher: [
    '/',
    '/((?!api/|sitemap|robots|_next/|healthz|sitecore/api/|-/|favicon.ico|sc_logo.svg).*)',
  ],
};
