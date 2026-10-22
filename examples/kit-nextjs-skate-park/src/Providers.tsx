"use client";
import React from "react";
import {
  ComponentPropsCollection,
  ComponentPropsContext,
  Page,
  SitecoreProvider,
} from "@sitecore-content-sdk/nextjs";
import scConfig from "sitecore.config";
import components from ".sitecore/component-map.client";
import CustomSitecoreForm from "./components/forms/CustomSitecoreForm";

// Ensure custom enhanced Form is used for Sitecore Form rendering
components.set("Form", CustomSitecoreForm);
import { MeUser } from "ordercloud-javascript-sdk";
import { UserHydrator } from "./components/AccountIndicator/UserHydrator";
import SitecoreSearchProvider from "./providers/SitecoreSearchProvider";

export default function Providers({
  children,
  page,
  componentProps = {},
  user = null,
  locale,
}: {
  children: React.ReactNode;
  page: Page;
  componentProps?: ComponentPropsCollection;
  user?: MeUser | null;
  locale: string;
}) {
  return (
    <SitecoreProvider
      api={scConfig.api}
      componentMap={components}
      page={page}
      loadImportMap={() => import(".sitecore/import-map.client")}
    >
      <UserHydrator user={user} />
      <ComponentPropsContext value={(componentProps as any)?.componentProps || componentProps}>
        <SitecoreSearchProvider locale={locale}>{children}</SitecoreSearchProvider>
      </ComponentPropsContext>
    </SitecoreProvider>
  );
}
