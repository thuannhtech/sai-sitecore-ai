// Client-safe component map for App Router

import { BYOCClientWrapper, NextjsContentSdkComponent, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

import * as SkateShipmentMethod from 'src/components/SkateShipmentMethod/SkateShipmentMethod';
import * as SkateProductList from 'src/components/SkateProductList/SkateProductList';
import * as SkateProductGallery from 'src/components/SkateProductDetail/SkateProductGallery';
import * as SkatePaymentMethod from 'src/components/SkatePaymentMethod/SkatePaymentMethod';
import * as SkateBraintreePayment from 'src/components/SkatePaymentMethod/SkateBraintreePayment';
import * as SkateMyAccountInformation from 'src/components/SkateMyAccountInformation/SkateMyAccountInformation';
import * as SkateLogout from 'src/components/SkateLogout/SkateLogout';
import * as SkateLoginLayout from 'src/components/SkateLoginLayout/SkateLoginLayout';
import * as SkateContainer from 'src/components/SkateContainer/SkateContainer';
import * as SkateCheckoutStep from 'src/components/SkateCheckoutStep/SkateCheckoutStep';
import * as SkateOrderSuccess from 'src/components/SkateCheckout/SkateOrderSuccess';
import * as SkateMiniCart from 'src/components/SkateCart/SkateMiniCart';
import * as SkateCartToggle from 'src/components/SkateCart/SkateCartToggle';
import * as SkateCartSummary from 'src/components/SkateCart/SkateCartSummary';
import * as SkateCartItemList from 'src/components/SkateCart/SkateCartItemList';
import * as SkateCart from 'src/components/SkateCart/SkateCart';
import * as SkateAddToCartButton from 'src/components/SkateCart/SkateAddToCartButton';
import * as SitecoreSearchProvider from 'src/components/search/SitecoreSearchProvider';
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
import * as UserHydrator from 'src/components/AccountIndicator/UserHydrator';
import * as SkateAccountIndicator from 'src/components/AccountIndicator/SkateAccountIndicator';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['SkateShipmentMethod', { ...SkateShipmentMethod }],
  ['SkateProductList', { ...SkateProductList }],
  ['SkateProductGallery', { ...SkateProductGallery }],
  ['SkatePaymentMethod', { ...SkatePaymentMethod }],
  ['SkateBraintreePayment', { ...SkateBraintreePayment }],
  ['SkateMyAccountInformation', { ...SkateMyAccountInformation }],
  ['SkateLogout', { ...SkateLogout }],
  ['SkateLoginLayout', { ...SkateLoginLayout }],
  ['SkateContainer', { ...SkateContainer }],
  ['SkateCheckoutStep', { ...SkateCheckoutStep }],
  ['SkateOrderSuccess', { ...SkateOrderSuccess }],
  ['SkateMiniCart', { ...SkateMiniCart }],
  ['SkateCartToggle', { ...SkateCartToggle }],
  ['SkateCartSummary', { ...SkateCartSummary }],
  ['SkateCartItemList', { ...SkateCartItemList }],
  ['SkateCart', { ...SkateCart }],
  ['SkateAddToCartButton', { ...SkateAddToCartButton }],
  ['SitecoreSearchProvider', { ...SitecoreSearchProvider }],
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
  ['UserHydrator', { ...UserHydrator }],
  ['SkateAccountIndicator', { ...SkateAccountIndicator }],
]);

export default componentMap;
