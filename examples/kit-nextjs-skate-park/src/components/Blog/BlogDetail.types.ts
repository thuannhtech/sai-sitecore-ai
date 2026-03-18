import { Field, ImageField, RichTextField } from '@sitecore-content-sdk/nextjs';

export interface BlogDetailProps {
    fields: {
        Title: Field<string>;
        Content: RichTextField;
        Image: ImageField;
        PublishDate: Field<string>;
        Categories: Field<string[]>;
        Author: Field<string>;
    };
}