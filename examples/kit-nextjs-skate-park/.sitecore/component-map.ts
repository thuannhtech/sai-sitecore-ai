// Below are built-in components that are available in the app, it's recommended to keep them as is

import { BYOCServerWrapper, NextjsContentSdkComponent, FEaaSServerWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in components
import * as TitleAndText from 'src/components/TitleAndText/TitleAndText';
import * as Title from 'src/components/title/Title';
import * as TailstoreHeader from 'src/components/TailstoreHeader/TailstoreHeader';
import * as TailstoreFooter from 'src/components/TailstoreFooter/TailstoreFooter';
import * as RowSplitter from 'src/components/row-splitter/RowSplitter';
import * as RichText from 'src/components/rich-text/RichText';
import * as Promo from 'src/components/promo/Promo';
import * as PartialDesignDynamicPlaceholder from 'src/components/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder';
import * as PageContent from 'src/components/page-content/PageContent';
import * as NextMenuHeader from 'src/components/NextMenuHeaderBar/NextMenuHeader';
import * as NextMenuHeaderBar from 'src/components/NextMenuHeader/NextMenuHeaderBar';
import * as Navigation from 'src/components/navigation/Navigation';
import * as MenuHeader from 'src/components/MenuHeader/MenuHeader';
import * as LinkList from 'src/components/link-list/LinkList';
import * as Image from 'src/components/image/Image';
import * as TailstorePromoBanner from 'src/components/home/TailstorePromoBanner';
import * as TailstoreHeroSlider from 'src/components/home/TailstoreHeroSlider';
import * as TailstoreCategoryBanners from 'src/components/home/TailstoreCategoryBanners';
import * as ContentBlock from 'src/components/content-block/ContentBlock';
import * as Container from 'src/components/container/Container';
import * as ColumnSplitter from 'src/components/column-splitter/ColumnSplitter';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCServerWrapper],
  ['FEaaSWrapper', FEaaSServerWrapper],
  ['Form', { ...Form, componentType: 'client' }],
  ['TitleAndText', { ...TitleAndText }],
  ['Title', { ...Title }],
  ['TailstoreHeader', { ...TailstoreHeader, componentType: 'client' }],
  ['TailstoreFooter', { ...TailstoreFooter, componentType: 'client' }],
  ['RowSplitter', { ...RowSplitter }],
  ['RichText', { ...RichText }],
  ['Promo', { ...Promo }],
  ['PartialDesignDynamicPlaceholder', { ...PartialDesignDynamicPlaceholder }],
  ['PageContent', { ...PageContent }],
  ['NextMenuHeader', { ...NextMenuHeader }],
  ['NextMenuHeaderBar', { ...NextMenuHeaderBar }],
  ['Navigation', { ...Navigation, componentType: 'client' }],
  ['MenuHeader', { ...MenuHeader, componentType: 'client' }],
  ['LinkList', { ...LinkList }],
  ['Image', { ...Image }],
  ['TailstorePromoBanner', { ...TailstorePromoBanner, componentType: 'client' }],
  ['TailstoreHeroSlider', { ...TailstoreHeroSlider, componentType: 'client' }],
  ['TailstoreCategoryBanners', { ...TailstoreCategoryBanners, componentType: 'client' }],
  ['ContentBlock', { ...ContentBlock }],
  ['Container', { ...Container }],
  ['ColumnSplitter', { ...ColumnSplitter }],
]);

export default componentMap;
