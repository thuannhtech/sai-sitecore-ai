import { SiteInfo } from '@sitecore-content-sdk/nextjs';
import { isDesignLibraryPreviewData } from '@sitecore-content-sdk/nextjs/editing';
import sites from '.sitecore/sites.json';
import scConfig from 'sitecore.config';
import client from 'src/lib/sitecore-client';
import { routing } from 'src/i18n/routing';

type RouteSearchParams = { [key: string]: string | string[] | undefined };

type LoadSitecorePageArgs = {
  draftEnabled: boolean;
  editingParams: RouteSearchParams;
  locale: string;
  path?: string[];
  site: string;
};

export function resolveRouteLocale(
  pathLocale: string,
  editingParams: RouteSearchParams,
  draftEnabled: boolean
) {
  if (!draftEnabled) {
    return pathLocale;
  }

  return (editingParams.sc_lang as string) || (editingParams.language as string) || pathLocale;
}

export async function loadSitecoreRoutePage({
  draftEnabled,
  editingParams,
  locale,
  path,
  site,
}: LoadSitecorePageArgs) {
  if (draftEnabled) {
    return isDesignLibraryPreviewData(editingParams)
      ? client.getDesignLibraryData(editingParams)
      : client.getPreview(editingParams);
  }

  return client.getPage(path ?? [], { site, locale });
}

export function getAllowedSiteNames() {
  const defaultSite = scConfig.defaultSite;

  if (!defaultSite) {
    return (sites as SiteInfo[]).map((site) => site.name);
  }

  return (sites as SiteInfo[])
    .filter((site) => site.name === defaultSite)
    .map((site) => site.name);
}

export function getStaticLocales() {
  return routing.locales.slice();
}
