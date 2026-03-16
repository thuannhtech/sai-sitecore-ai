import { Field, Text } from '@sitecore-content-sdk/nextjs';
import React from 'react';

interface Fields {
    Title: Field<string>;
}

type NextjsMenuHeaderBarProps = {
    fields: Fields;
};

export const Default: React.FC<NextjsMenuHeaderBarProps> = ({ fields }) => {
    return (
        <div className="contentBlock" >
        </div>
    );
};