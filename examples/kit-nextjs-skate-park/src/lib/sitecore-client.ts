import { enableDebug } from '@sitecore-content-sdk/core';
import { SitecoreClient } from '@sitecore-content-sdk/nextjs/client';
import scConfig from 'sitecore.config';

enableDebug('content-sdk:http');

const client = new SitecoreClient({
  ...scConfig,
});

export default client;
