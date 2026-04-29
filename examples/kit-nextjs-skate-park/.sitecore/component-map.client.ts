// Client-safe component map for App Router

import { BYOCClientWrapper, NextjsContentSdkComponent, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

import * as SkateProductList from 'src/components/SkateProductList/SkateProductList';
import * as SkateMiniCart from 'src/components/SkateCart/SkateMiniCart';
import * as SkateCartToggle from 'src/components/SkateCart/SkateCartToggle';
import * as SkateCartSummary from 'src/components/SkateCart/SkateCartSummary';
import * as SkateCartItemList from 'src/components/SkateCart/SkateCartItemList';
import * as SkateCart from 'src/components/SkateCart/SkateCart';
import * as SkateAddToCartButton from 'src/components/SkateCart/SkateAddToCartButton';
import * as ProductList from 'src/components/ProductList/ProductList';
import * as NewBannerSlider from 'src/components/NewBannerSlider/NewBannerSlider';
import * as Navigation from 'src/components/navigation/Navigation';
import * as MultiPromoItemdev from 'src/components/multi-promo/MultiPromoItem.dev';
import * as MultiPromo from 'src/components/multi-promo/MultiPromo';
import * as LanguageSwitcher from 'src/components/MenuHeader/LanguageSwitcher';
import * as Menu from 'src/components/Menu/Menu';
import * as BasicForm from 'src/components/forms/BasicForm';
import * as BlogListing from 'src/components/BlogListing/BlogListing';
import * as BannerSlider from 'src/components/BannerSlider/BannerSlider';
import * as BannerSlideItem from 'src/components/BannerSlideItem/BannerSlideItem';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['SkateProductList', { ...SkateProductList }],
  ['SkateMiniCart', { ...SkateMiniCart }],
  ['SkateCartToggle', { ...SkateCartToggle }],
  ['SkateCartSummary', { ...SkateCartSummary }],
  ['SkateCartItemList', { ...SkateCartItemList }],
  ['SkateCart', { ...SkateCart }],
  ['SkateAddToCartButton', { ...SkateAddToCartButton }],
  ['ProductList', { ...ProductList }],
  ['NewBannerSlider', { ...NewBannerSlider }],
  ['Navigation', { ...Navigation }],
  ['MultiPromoItem', { ...MultiPromoItemdev }],
  ['MultiPromo', { ...MultiPromo }],
  ['LanguageSwitcher', { ...LanguageSwitcher }],
  ['Menu', { ...Menu }],
  ['BasicForm', { ...BasicForm }],
  ['BlogListing', { ...BlogListing }],
  ['BannerSlider', { ...BannerSlider }],
  ['BannerSlideItem', { ...BannerSlideItem }],
]);

export default componentMap;
