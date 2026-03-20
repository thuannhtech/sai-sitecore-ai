import { Field, ImageField, RichTextField, ComponentRendering, ComponentParams } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface BlogDetailProps extends ComponentProps {
    rendering: BlogDetailRendering;
    params: BlogDetailParams;
    fields: {
        Title: Field<string>;
        Summary?: Field<string>;
        Content: RichTextField;
        Image: ImageField;
        PublishDate: Field<string>;
        Categories: Field<string[]>;
        Author: Field<string>;
    };
}

export interface BlogDetailRendering extends ComponentRendering {
    dataSource?: string;
}

export interface BlogDetailParams extends ComponentParams {
    [key: string]: string;
}

