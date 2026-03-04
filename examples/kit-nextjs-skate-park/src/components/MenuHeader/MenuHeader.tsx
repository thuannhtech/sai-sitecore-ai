import {
    NextImage as ContentSdkImage,
    Field,
    ImageField
} from "@sitecore-content-sdk/nextjs";
import { useTranslations } from "next-intl";
import React from 'react';

interface Fields {
    Image: ImageField;
    Languages: Field<string>;
}

type MenuHeaderBarProps = {
    params: { [key: string]: string };
    fields: Fields;
};

export const Default: React.FC<MenuHeaderBarProps> = ({ params, fields }) => {
    const t = useTranslations("sai-sitecore");

    return (
        <div className="header-bar">
            12312321
        </div>
    );
};
