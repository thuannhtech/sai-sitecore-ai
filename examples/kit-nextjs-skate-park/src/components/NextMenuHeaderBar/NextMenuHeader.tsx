import {
    NextImage as ContentSdkImage,
    ImageField
} from "@sitecore-content-sdk/nextjs";
import { useTranslations } from "next-intl";
import React from 'react';

interface Fields {
    Image: ImageField;
}

type NextjsMenuHeaderBarProps = {
    fields: Fields;
};

export const Default: React.FC<NextjsMenuHeaderBarProps> = ({ fields }) => {
    const t = useTranslations("sai-sitecore");
    console.log(fields)
    return (
        <div className="header-bar">
            
        </div>
    );
};