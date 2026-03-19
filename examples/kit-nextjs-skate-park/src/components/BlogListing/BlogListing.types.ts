import { Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export interface BlogItem {
    id: string;
    url: {
        path: string;
    };
    title: Field<string>;
    image: {
        jsonValue: ImageField;
    };
    publishDate: Field<string>;
    author: Field<string>;
}

export interface BlogListingRendering extends ComponentProps {
    datasource: {
        pageSize: Field<string>;
        rootPath: Field<string>;
    };
    blogs: {
        total: number;
        results: {
            items: BlogItem[];
        };
    };
}