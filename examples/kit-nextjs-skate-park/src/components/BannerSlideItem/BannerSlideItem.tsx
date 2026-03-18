import {
    ImageField,
    Image
} from '@sitecore-content-sdk/nextjs';

type Props = {
    fields: {
        Image: ImageField;
    };
};

export const Default = (props: Props) => {
    return (
        <Image field={props.fields.Image} className="banner-slide__img" />
    );
};