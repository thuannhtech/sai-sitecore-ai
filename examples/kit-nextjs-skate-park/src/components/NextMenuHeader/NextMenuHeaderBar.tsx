import { Field, Text } from '@sitecore-content-sdk/nextjs';
import React from 'react';

interface MenuItem {
    name: string;
    id: string;
    fields: {
        Title: Field<string>;
    };
}

interface Fields {
    Title: Field<string>;
    items?: MenuItem[];
}

type NextjsMenuHeaderBarProps = {
    fields: Fields;
};

export const Default: React.FC<NextjsMenuHeaderBarProps> = ({ fields }) => {
    const { items = [] } = fields || {};
    return (
        <div className="contentBlock">
            {items
                .filter((a) => a.name !== 'Data')
                .map((a) => (
                    <div key={a.id} style={{ padding: 10 }}>
                        <Text field={a.fields.Title} />
                    </div>
                ))}
        </div>
    );
};