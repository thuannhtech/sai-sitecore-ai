import { Field, Text } from '@sitecore-content-sdk/nextjs';
import React from 'react';

interface Fields {
    Title: Field<string>;
}

type NextjsMenuHeaderBarProps = {
    fields: Fields;
};

export const Default: React.FC<NextjsMenuHeaderBarProps> = ({ fields }) => {
    const { items }: any = fields || {}
    console.log(fields)
    return (
        <div className="contentBlock" >
            {
                items.filter((a: any) => a.name !== "Data").map((a: any) => {
                    return <Text field={a.fields.Title} style={{ padding: 10 }} />
                })
            }

        </div>
    );
};