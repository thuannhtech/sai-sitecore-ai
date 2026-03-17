// Client-safe component map for App Router

import { BYOCClientWrapper, NextjsContentSdkComponent, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

import * as TailstoreHeader from 'src/components/TailstoreHeader/TailstoreHeader';
import * as TailstoreFooter from 'src/components/TailstoreFooter/TailstoreFooter';
import * as Navigation from 'src/components/navigation/Navigation';
import * as MenuHeader from 'src/components/MenuHeader/MenuHeader';
import * as TailstorePromoBanner from 'src/components/home/TailstorePromoBanner';
import * as TailstoreHeroSlider from 'src/components/home/TailstoreHeroSlider';
import * as TailstoreCategoryBanners from 'src/components/home/TailstoreCategoryBanners';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['TailstoreHeader', { ...TailstoreHeader }],
  ['TailstoreFooter', { ...TailstoreFooter }],
  ['Navigation', { ...Navigation }],
  ['MenuHeader', { ...MenuHeader }],
  ['TailstorePromoBanner', { ...TailstorePromoBanner }],
  ['TailstoreHeroSlider', { ...TailstoreHeroSlider }],
  ['TailstoreCategoryBanners', { ...TailstoreCategoryBanners }],
]);

export default componentMap;
