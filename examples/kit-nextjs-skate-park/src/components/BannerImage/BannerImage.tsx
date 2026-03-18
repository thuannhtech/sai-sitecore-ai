import React, { JSX, useMemo } from 'react';
import { ImageField, Image, Link, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface ImageBannerProps extends ComponentProps {
    fields: {
        Image: ImageField;
        TargetLink: LinkField;
        ClassName?: { value: string };
        StyleCSS?: { value: string };
    };
}

const parseInlineStyle = (styleString?: string): React.CSSProperties => {
    if (!styleString) return {};
    try {
        return styleString.split(';').reduce((styleObj: any, style) => {
            const [prop, value] = style.split(':');
            if (prop && value) {
                const key = prop.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                styleObj[key] = value.trim();
            }
            return styleObj;
        }, {});
    } catch (error) {
        console.error('CSS Parsing Error:', error);
        return {};
    }
};

export const Default = (props: ImageBannerProps): JSX.Element => {
    const { fields } = props;

    const inlineStyles = useMemo(
        () => parseInlineStyle(fields?.StyleCSS?.value),
        [fields?.StyleCSS?.value]
    );

    if (!fields) {
        return (
            <div className="p-4 border-2 border-dashed border-gray-300 text-center">
                Image Banner: Missing Datasource
            </div>
        );
    }

    const customClassName = fields.ClassName?.value || '';

    const RenderImage = () => (
        <Image
            field={fields.Image}
            className="max-w-full h-auto transition-all duration-300 hover:opacity-90"
        />
    );

    return (
        <section
            className={`image-banner-wrapper flex justify-center py-8 ${customClassName}`.trim()}
            style={inlineStyles}
        >
            <div className="container mx-auto px-4 flex justify-center">
                {fields.TargetLink?.value?.href ? (
                    <Link field={fields.TargetLink}>
                        <RenderImage />
                    </Link>
                ) : (
                    <RenderImage />
                )}
            </div>
        </section>
    );
};