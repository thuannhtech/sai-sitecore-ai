import {
    Field,
    ImageField,
    Image
} from "@sitecore-content-sdk/nextjs";
import React from 'react';
import { Link } from 'src/i18n/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SkateCartToggle } from '../SkateCart/SkateCartToggle';
import { SkateAccountIndicator } from '../AccountIndicator/SkateAccountIndicator';
import { MeUser } from 'ordercloud-javascript-sdk';

interface Fields {
    Image: ImageField;
    Languages?: Field<string>;
    user?: MeUser | null;
}

type MenuHeaderBarProps = {
    params: { [key: string]: string };
    fields: Fields;
};

export const Default: React.FC<MenuHeaderBarProps> = async (props) => {
    const { params, fields } = props;
    const styles = `${params.GridParameters || ''} ${params.styles || ''}`.trim();
    const id = params.RenderingIdentifier || undefined;

    return (
        <div
            className={`component menu-header ${styles}`.trim()}
            id={id}
        >
            {/* Logo Section */}
            <div className="header-logo-section">
                <Link className="header-bar_logo" id="home-page-link-logo" href="/">
                    <Image
                        field={fields.Image}
                        className="header-logo-img"
                    />
                </Link>
            </div>

            {/* Utility Section (Language & Search) */}
            <div className="utility-section">

                {/* Account Indicator */}
                <SkateAccountIndicator user={fields?.user} />

                {/* Cart Toggle */}
                <SkateCartToggle />

                {/* Language Switcher */}
                <LanguageSwitcher />

                {/* Search */}
                <div className="header-search-box">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <span>Search</span>
                </div>
            </div>
        </div>
    );
};
