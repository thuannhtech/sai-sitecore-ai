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
import { MeUser } from "ordercloud-javascript-sdk";
import { UserHydrator } from "./components/AccountIndicator/UserHydrator";

export default function Providers({
  children,
  page,
  componentProps = {},
  user,
}: {
  children: React.ReactNode;
  page: Page;
  componentProps?: ComponentPropsCollection;
  user: MeUser | null;
}) {
  return (
    <SitecoreProvider
      api={scConfig.api}
      componentMap={components}
      page={page}
      loadImportMap={() => import(".sitecore/import-map.client")}
    >
      <UserHydrator user={user} />
      <ComponentPropsContext value={componentProps}>
        {children}
      </ComponentPropsContext>
    </SitecoreProvider>
  );
}
