import { Field, ImageField, RichTextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface BlogDetailProps extends ComponentProps {
    fields: {
        Title: Field<string>;
        Content: RichTextField;
        Image: ImageField;
        PublishDate: Field<string>;
        Categories: Field<string[]>;
        Author: Field<string>;
    };
}