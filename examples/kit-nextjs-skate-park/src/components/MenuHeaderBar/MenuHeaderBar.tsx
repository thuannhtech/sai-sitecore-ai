import {
    NextImage as ContentSdkImage,
    Field,
    ImageField
} from "@sitecore-content-sdk/nextjs";
import { useTranslations } from "next-intl";
import React from 'react';

interface Fields {
    LogoIcon: ImageField;
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
            <a className="header-bar_logo" id="home-page-link-logo">
                <ContentSdkImage
                    field={fields.LogoIcon}
                />
            </a>
            <div className="top-search-right-bar">
                <button type="button" className="global-search_btn_v2">
                    <img src="https://www.brother.com.sg/-/media/ap2/Global/Menu/search.svg" alt="search icon" />
                    {t('HEADER_SEARCH')}
                </button>
                <div className="mobile-hamburger js-hamburger">
                    <img src="https://www.brother.com.sg/-/media/ap2/Global/Menu/hamburger.svg" alt="hamburger icon" />
                </div>
            </div>
        </div>
    );
};

export const MenuHeaderBarSearchWithoutLanguageSelector: React.FC<MenuHeaderBarProps> = ({ params, fields }) => {
    const t = useTranslations("sai-sitecore");

    return (
        <div className="header-bar">
            <a className="header-bar_logo" id="home-page-link-logo">
                <ContentSdkImage
                    field={fields.LogoIcon}
                />
            </a>
        </div>
    );
};