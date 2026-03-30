import {
    Field,
    ImageField,
    Image
} from "@sitecore-content-sdk/nextjs";
import React from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';

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
            className={`component menu-header ${styles}`.trim()}
            id={id}
            style={{
                width: '100%',
                height: '60px', // Fixed height for perfect centering
                marginBottom: '40px',
                backgroundColor: '#0022a1', // Brother Blue
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 40px'
            }}
        >
            {/* Logo Section */}
            <div className="header-logo-section" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <a className="header-bar_logo" id="home-page-link-logo" href="/" style={{ display: 'flex', alignItems: 'center' }}>
                    <Image
                        field={fields.Image}
                        style={{ display: 'block', maxHeight: '50px', width: 'auto' }}
                    />
                </a>
            </div>

            {/* Utility Section (Language & Search) */}
            <div
                style={{
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    fontSize: '14px',
                    fontFamily: 'sans-serif'
                }}
            >
                {/* Language Switcher */}
                <LanguageSwitcher />

                {/* Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
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
