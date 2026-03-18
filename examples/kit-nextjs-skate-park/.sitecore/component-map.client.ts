// Client-safe component map for App Router

import { BYOCClientWrapper, NextjsContentSdkComponent, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

import * as NewBannerSlider from 'src/components/NewBannerSlider/NewBannerSlider';
import * as Navigation from 'src/components/navigation/Navigation';
import * as Menu from 'src/components/Menu/Menu';
import * as BannerSlider from 'src/components/BannerSlider/BannerSlider';
import * as BannerSlideItem from 'src/components/BannerSlideItem/BannerSlideItem';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['NewBannerSlider', { ...NewBannerSlider }],
  ['Navigation', { ...Navigation }],
  ['Menu', { ...Menu }],
  ['BannerSlider', { ...BannerSlider }],
  ['BannerSlideItem', { ...BannerSlideItem }],
]);

export default componentMap;
