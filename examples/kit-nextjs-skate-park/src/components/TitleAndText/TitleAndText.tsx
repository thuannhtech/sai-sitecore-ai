import React from 'react';
import { Field, Text } from '@sitecore-content-sdk/nextjs';

interface Fields {
    Title: Field<string>;
    Text: Field<string>;
}

type TitleAndTextProps = {
    params: { [key: string]: string };
    fields: Fields;
};

export const Default = (props: TitleAndTextProps): React.ReactElement => {
    const containerStyles = props.params && props.params.styles ? props.params.styles : '';
    const styles = `${props.params.GridParameters} ${containerStyles}`.trimEnd();

    return (
        <div className={`container-default component ${styles}`}>
            <div data-class-change className={containerStyles}>
                This container must be refreshed without reloading the page.
            </div>
            <h1 className="component-content title row">
                <Text field={props.fields.Title} />
            </h1>
            <div className="component-content text row">
                <Text field={props.fields.Text} />
            </div>
        </div>
    );
};

