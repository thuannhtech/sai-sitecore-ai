import {
    ImageField
} from "@sitecore-content-sdk/nextjs";
import React from 'react';

interface Fields {
    Image: ImageField;
}

type NextjsMenuHeaderBarProps = {
    fields: Fields;
};

export const Default: React.FC<NextjsMenuHeaderBarProps> = ({ fields }) => {
    return (
        <div className="header-bar">

        </div>
    );
};