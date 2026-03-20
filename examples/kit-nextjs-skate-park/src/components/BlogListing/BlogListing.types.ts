import { Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';


// --- Interfaces ---
export interface SitecoreField {
    name: string;
    jsonValue: {
        value?: string;
        // Thêm các type khác tuỳ cấu trúc của bạn (image, link...)
        [key: string]: any;
    };
}

export interface BlogItem {
    id: string;
    name: string;
    url: {
        path: string;
    };
    fields: SitecoreField[];
}

export interface RenderingParams {
    BlogsFolder?: string;
    Limit?: string;
    Variant?: string;
    ShowSearchBox?: string;
    AllowSort?: string;
}

export interface BlogListingProps {
    rendering: {
        params?: RenderingParams;
        fields: {
            SectionTitle: Field<string>;
            SectionDescription: Field<string>;
        };
    };
}
