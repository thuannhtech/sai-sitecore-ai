import { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export type FooterProps = ComponentProps & {
  fields: {
    Title?: Field<string>;
    CopyrightText?: Field<string>;
    FacebookLink?: LinkField;
    InstagramLink?: LinkField;
    LinkedinLink?: LinkField;
  };
};
