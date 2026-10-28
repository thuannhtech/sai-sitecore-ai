"use client";

import React, { useMemo } from "react";
import { PageController, WidgetsProvider } from "@sitecore-search/react";
import type { Environment } from "@sitecore-search/data";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import config from "src/lib/config";

type SitecoreSearchProviderProps = {
  children: React.ReactNode;
  locale: string;
};

const normalizeLocale = (locale: string) => {
  const [language = "en", country = "us"] = locale.split(/[-_]/);

  // Fallback to 'en' and 'us' for the Sitecore Search API context if the language is not 'en',
  // as the search domain may not have other locales enabled, preventing "requested locale not valid for domain" error.
  if (language.toLowerCase() !== "en") {
    return {
      language: "en",
      country: "us",
    };
  }

  return {
    language: language.toLowerCase(),
    country: country.toLowerCase(),
  };
};

const SEARCH_ENVIRONMENTS: Environment[] = ["prod", "prodEu", "apse2"];

const isSearchEnvironment = (value: string | undefined): value is Environment =>
  !!value && SEARCH_ENVIRONMENTS.includes(value as Environment);

export default function SitecoreSearchProvider({
  children,
  locale,
}: SitecoreSearchProviderProps) {
  const { language, country } = normalizeLocale(locale);

  PageController.getContext().setLocaleLanguage(language);
  PageController.getContext().setLocaleCountry(country);

  const {
    env,
    customerKey,
    serviceHost,
    apiKey,
    publicSuffix,
    trackConsent,
  } = config.sitecoreSearch;

  const fallbackQueryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      }),
    []
  );

  const isValidEnv = isSearchEnvironment(env);
  const isValidCustomerKey =
    !!customerKey && customerKey !== "undefined" && customerKey !== "null" && customerKey.trim() !== "";
  const isValidApiOrHost =
    (!!serviceHost && serviceHost !== "undefined" && serviceHost.trim() !== "") ||
    (!!apiKey && apiKey !== "undefined" && apiKey.trim() !== "");

  const isConfigured = isValidEnv && isValidCustomerKey && isValidApiOrHost;

  if (!isConfigured) {
    return (
      <QueryClientProvider client={fallbackQueryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return (
    <WidgetsProvider
      env={env}
      customerKey={customerKey}
      serviceHost={serviceHost}
      apiKey={apiKey}
      publicSuffix={publicSuffix}
      trackConsent={trackConsent}
    >
      {children}
    </WidgetsProvider>
  );
}
