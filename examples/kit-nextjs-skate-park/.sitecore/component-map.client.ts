// Client-safe component map for App Router

import { BYOCClientWrapper, NextjsContentSdkComponent, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

import * as TailstoreConnectivityTest from 'src/components/shared/TailstoreConnectivityTest';
import * as Navigation from 'src/components/navigation/Navigation';
import * as MenuHeader from 'src/components/MenuHeader/MenuHeader';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['TailstoreConnectivityTest', { ...TailstoreConnectivityTest }],
  ['Navigation', { ...Navigation }],
  ['MenuHeader', { ...MenuHeader }],
]);

export default componentMap;
