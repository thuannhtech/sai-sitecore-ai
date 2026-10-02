import {
    Field,
    ImageField,
    Image
} from "@sitecore-content-sdk/nextjs";
import React from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SkateCartToggle } from '../SkateCart/SkateCartToggle';
import { SkateAccountIndicator } from '../AccountIndicator/SkateAccountIndicator';
import { MeUser } from 'ordercloud-javascript-sdk';
import { HeaderSearch } from './HeaderSearch';

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
                <a className="header-bar_logo" id="home-page-link-logo" href="/">
                    <Image
                        field={fields.Image}
                        className="header-logo-img"
                        editable={false}
                    />
                </a>
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
                <HeaderSearch />
            </div>
        </div>
    );
};
