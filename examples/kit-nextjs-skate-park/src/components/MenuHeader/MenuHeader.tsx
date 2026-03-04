"use client";
import {
    Field,
    ImageField,
    useComponentProps
} from "@sitecore-content-sdk/nextjs";
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
    const data = useComponentProps<MenuHeaderBarProps>("");
    return (
        <div className="header-bar">
            12312321
        </div>
    );
};
