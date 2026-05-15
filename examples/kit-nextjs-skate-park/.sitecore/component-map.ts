// Below are built-in components that are available in the app, it's recommended to keep them as is

import { BYOCServerWrapper, NextjsContentSdkComponent, FEaaSServerWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in components
import * as ProductCard from 'src/components/ProductCard';
import * as TitleAndText from 'src/components/TitleAndText/TitleAndText';
import * as Title from 'src/components/title/Title';
import * as SkateShipmentMethod from 'src/components/SkateShipmentMethod/SkateShipmentMethod';
import * as SkateProductList from 'src/components/SkateProductList/SkateProductList';
import * as SkateProductGallery from 'src/components/SkateProductDetail/SkateProductGallery';
import * as SkateProductDetail from 'src/components/SkateProductDetail/SkateProductDetail';
import * as SkatePaymentMethod from 'src/components/SkatePaymentMethod/SkatePaymentMethod';
import * as SkateBraintreePayment from 'src/components/SkatePaymentMethod/SkateBraintreePayment';
import * as SkateOrderDetail from 'src/components/SkateOrderDetail/SkateOrderDetail';
import * as SkateMyAccountInformation from 'src/components/SkateMyAccountInformation/SkateMyAccountInformation';
import * as SkateLogout from 'src/components/SkateLogout/SkateLogout';
import * as SkateLoginLayout from 'src/components/SkateLoginLayout/SkateLoginLayout';
import * as SkateContainer from 'src/components/SkateContainer/SkateContainer';
import * as SkateCheckoutStep from 'src/components/SkateCheckoutStep/SkateCheckoutStep';
import * as SkateOrderSuccess from 'src/components/SkateCheckout/SkateOrderSuccess';
import * as SkateCheckout from 'src/components/SkateCheckout/SkateCheckout';
import * as SkateMiniCart from 'src/components/SkateCart/SkateMiniCart';
import * as SkateCartToggle from 'src/components/SkateCart/SkateCartToggle';
import * as SkateCartSummary from 'src/components/SkateCart/SkateCartSummary';
import * as SkateCartItemList from 'src/components/SkateCart/SkateCartItemList';
import * as SkateCart from 'src/components/SkateCart/SkateCart';
import * as SkateAddToCartButton from 'src/components/SkateCart/SkateAddToCartButton';
import * as SitecoreSearchProvider from 'src/components/search/SitecoreSearchProvider';
import * as RowSplitter from 'src/components/row-splitter/RowSplitter';
import * as RichText from 'src/components/rich-text/RichText';
import * as Promo from 'src/components/promo/Promo';
import * as ProductList from 'src/components/ProductList/ProductList';
import * as index from 'src/components/ProductList/index';
import * as PartialDesignDynamicPlaceholder from 'src/components/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder';
import * as PageContent from 'src/components/page-content/PageContent';
import * as NextMenuHeader from 'src/components/NextMenuHeaderBar/NextMenuHeader';
import * as NextMenuHeaderBar from 'src/components/NextMenuHeader/NextMenuHeaderBar';
import * as NewBannerSlider from 'src/components/NewBannerSlider/NewBannerSlider';
import * as Navigation from 'src/components/navigation/Navigation';
import * as MultiPromoItemdev from 'src/components/multi-promo/MultiPromoItem.dev';
import * as MultiPromo from 'src/components/multi-promo/MultiPromo';
import * as multipromoprops from 'src/components/multi-promo/multi-promo.props';
import * as multipromoMultiPromo2Block from 'src/components/multi-promo/multi-promo.MultiPromo2Block';
import * as MenuHeaderSitecoreAiGeneratedVariant from 'src/components/MenuHeader/MenuHeader.SitecoreAiGeneratedVariant';
import * as MenuHeader from 'src/components/MenuHeader/MenuHeader';
import * as LanguageSwitcher from 'src/components/MenuHeader/LanguageSwitcher';
import * as Menu from 'src/components/Menu/Menu';
import * as LinkList from 'src/components/link-list/LinkList';
import * as Image from 'src/components/image/Image';
import * as BasicForm from 'src/components/forms/BasicForm';
import * as FooterNavigationColumn from 'src/components/Footer/FooterNavigationColumn';
import * as Footer from 'src/components/Footer/Footer';
import * as footerprops from 'src/components/Footer/footer.props';
import * as ContentBlock from 'src/components/content-block/ContentBlock';
import * as Container from 'src/components/container/Container';
import * as ColumnSplitter from 'src/components/column-splitter/ColumnSplitter';
import * as BlogListingtypes from 'src/components/BlogListing/BlogListing.types';
import * as BlogListing from 'src/components/BlogListing/BlogListing';
import * as BlogDetailtypes from 'src/components/Blog/BlogDetail.types';
import * as BlogDetail from 'src/components/Blog/BlogDetail';
import * as BannerSlider from 'src/components/BannerSlider/BannerSlider';
import * as BannerSlideItem from 'src/components/BannerSlideItem/BannerSlideItem';
import * as BannerImage from 'src/components/BannerImage/BannerImage';
import * as UserHydrator from 'src/components/AccountIndicator/UserHydrator';
import * as SkateAccountIndicator from 'src/components/AccountIndicator/SkateAccountIndicator';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCServerWrapper],
  ['FEaaSWrapper', FEaaSServerWrapper],
  ['Form', { ...Form, componentType: 'client' }],
  ['ProductCard', { ...ProductCard }],
  ['TitleAndText', { ...TitleAndText }],
  ['Title', { ...Title }],
  ['SkateShipmentMethod', { ...SkateShipmentMethod, componentType: 'client' }],
  ['SkateProductList', { ...SkateProductList, componentType: 'client' }],
  ['SkateProductGallery', { ...SkateProductGallery, componentType: 'client' }],
  ['SkateProductDetail', { ...SkateProductDetail }],
  ['SkatePaymentMethod', { ...SkatePaymentMethod, componentType: 'client' }],
  ['SkateBraintreePayment', { ...SkateBraintreePayment, componentType: 'client' }],
  ['SkateOrderDetail', { ...SkateOrderDetail, componentType: 'client' }],
  ['SkateMyAccountInformation', { ...SkateMyAccountInformation, componentType: 'client' }],
  ['SkateLogout', { ...SkateLogout, componentType: 'client' }],
  ['SkateLoginLayout', { ...SkateLoginLayout, componentType: 'client' }],
  ['SkateContainer', { ...SkateContainer, componentType: 'client' }],
  ['SkateCheckoutStep', { ...SkateCheckoutStep, componentType: 'client' }],
  ['SkateOrderSuccess', { ...SkateOrderSuccess, componentType: 'client' }],
  ['SkateCheckout', { ...SkateCheckout }],
  ['SkateMiniCart', { ...SkateMiniCart, componentType: 'client' }],
  ['SkateCartToggle', { ...SkateCartToggle, componentType: 'client' }],
  ['SkateCartSummary', { ...SkateCartSummary, componentType: 'client' }],
  ['SkateCartItemList', { ...SkateCartItemList, componentType: 'client' }],
  ['SkateCart', { ...SkateCart, componentType: 'client' }],
  ['SkateAddToCartButton', { ...SkateAddToCartButton, componentType: 'client' }],
  ['SitecoreSearchProvider', { ...SitecoreSearchProvider, componentType: 'client' }],
  ['RowSplitter', { ...RowSplitter }],
  ['RichText', { ...RichText }],
  ['Promo', { ...Promo }],
  ['ProductList', { ...ProductList, componentType: 'client' }],
  ['index', { ...index }],
  ['PartialDesignDynamicPlaceholder', { ...PartialDesignDynamicPlaceholder }],
  ['PageContent', { ...PageContent }],
  ['NextMenuHeader', { ...NextMenuHeader }],
  ['NextMenuHeaderBar', { ...NextMenuHeaderBar }],
  ['NewBannerSlider', { ...NewBannerSlider, componentType: 'client' }],
  ['Navigation', { ...Navigation, componentType: 'client' }],
  ['MultiPromoItem', { ...MultiPromoItemdev }],
  ['MultiPromo', { ...MultiPromo, componentType: 'client' }],
  ['multi-promo', { ...multipromoprops, ...multipromoMultiPromo2Block }],
  ['MenuHeader', { ...MenuHeaderSitecoreAiGeneratedVariant, ...MenuHeader }],
  ['LanguageSwitcher', { ...LanguageSwitcher, componentType: 'client' }],
  ['Menu', { ...Menu, componentType: 'client' }],
  ['LinkList', { ...LinkList }],
  ['Image', { ...Image }],
  ['BasicForm', { ...BasicForm, componentType: 'client' }],
  ['FooterNavigationColumn', { ...FooterNavigationColumn }],
  ['Footer', { ...Footer }],
  ['footer', { ...footerprops }],
  ['ContentBlock', { ...ContentBlock }],
  ['Container', { ...Container }],
  ['ColumnSplitter', { ...ColumnSplitter }],
  ['BlogListing', { ...BlogListingtypes, ...BlogListing, componentType: 'client' }],
  ['BlogDetail', { ...BlogDetailtypes, ...BlogDetail }],
  ['BannerSlider', { ...BannerSlider, componentType: 'client' }],
  ['BannerSlideItem', { ...BannerSlideItem, componentType: 'client' }],
  ['BannerImage', { ...BannerImage }],
  ['UserHydrator', { ...UserHydrator, componentType: 'client' }],
  ['SkateAccountIndicator', { ...SkateAccountIndicator, componentType: 'client' }],
]);

export default componentMap;
