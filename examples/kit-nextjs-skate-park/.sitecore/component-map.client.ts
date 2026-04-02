// Client-safe component map for App Router

import { BYOCClientWrapper, NextjsContentSdkComponent, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

import * as NewBannerSlider from 'src/components/NewBannerSlider/NewBannerSlider';
import * as Navigation from 'src/components/navigation/Navigation';
import * as MultiPromoItemdev from 'src/components/multi-promo/MultiPromoItem.dev';
import * as MultiPromo from 'src/components/multi-promo/MultiPromo';
import * as LanguageSwitcher from 'src/components/MenuHeader/LanguageSwitcher';
import * as Menu from 'src/components/Menu/Menu';
import * as BlogListing from 'src/components/BlogListing/BlogListing';
import * as BannerSlider from 'src/components/BannerSlider/BannerSlider';
import * as BannerSlideItem from 'src/components/BannerSlideItem/BannerSlideItem';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['NewBannerSlider', { ...NewBannerSlider }],
  ['Navigation', { ...Navigation }],
  ['MultiPromoItem', { ...MultiPromoItemdev }],
  ['MultiPromo', { ...MultiPromo }],
  ['LanguageSwitcher', { ...LanguageSwitcher }],
  ['Menu', { ...Menu }],
  ['BlogListing', { ...BlogListing }],
  ['BannerSlider', { ...BannerSlider }],
  ['BannerSlideItem', { ...BannerSlideItem }],
]);

export default componentMap;
