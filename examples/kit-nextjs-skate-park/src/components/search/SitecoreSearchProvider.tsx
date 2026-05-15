"use client";

import React from "react";
import { PageController, WidgetsProvider } from "@sitecore-search/react";
import config from "src/lib/config";

type SitecoreSearchProviderProps = {
  children: React.ReactNode;
  locale: string;
};

const normalizeLocale = (locale: string) => {
  const [language = "en", country = "us"] = locale.split(/[-_]/);

  return {
    language: language.toLowerCase(),
    country: country.toLowerCase(),
  };
};

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

  if (!env || !customerKey || (!serviceHost && !apiKey)) {
    return <>{children}</>;
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
