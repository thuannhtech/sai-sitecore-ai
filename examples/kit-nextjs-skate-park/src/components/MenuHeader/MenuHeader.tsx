import {
    Field,
    ImageField,
    Image
} from "@sitecore-content-sdk/nextjs";
import React from 'react';

interface Fields {
    Image: ImageField;
    Languages?: Field<string>;
}

type MenuHeaderBarProps = {
    params: { [key: string]: string };
    fields: Fields;
};

export const Default: React.FC<MenuHeaderBarProps> = ({ params, fields }) => {
    const styles = `${params.GridParameters || ''} ${params.styles || ''}`.trim();
    const id = params.RenderingIdentifier || undefined;

    return (
        <div
            className={`header-bar component menu-header-bar ${styles}`.trim()}
            id={id}
            style={{ width: '100%', padding: '10px', marginBottom: '40px' }}
        >
            <a className="header-bar_logo" id="home-page-link-logo" href="/">
                <Image field={fields.Image} />
            </a>
            <div className="top-search-right-bar">
                <button type="button" className="global-search_btn_v2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://www.brother.com.sg/-/media/ap2/Global/Menu/search.svg" alt="search icon" />
                    Search
                </button>
                <div className="mobile-hamburger js-hamburger">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://www.brother.com.sg/-/media/ap2/Global/Menu/hamburger.svg" alt="hamburger icon" />
                </div>
            </div>
        </div>
    );
};
