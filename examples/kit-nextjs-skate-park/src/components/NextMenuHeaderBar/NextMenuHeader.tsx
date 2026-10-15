import {
    NextImage as ContentSdkImage,
    ImageField
} from "@sitecore-content-sdk/nextjs";
import { useTranslations } from "next-intl";
import React from 'react';
import sitecoreConfig from "sitecore.config";

interface Fields {
    Image: ImageField;
}

type NextjsMenuHeaderBarProps = {
    fields: Fields;
};

export const Default: React.FC<NextjsMenuHeaderBarProps> = ({ fields }) => {
    //const t = useTranslations("sai-sitecore");
    const t = useTranslations(sitecoreConfig.defaultSite || undefined);
    console.log(fields)
    return (
        <div className="header-bar">
            
        </div>
    );
};