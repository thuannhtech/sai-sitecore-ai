import React from 'react';
import {
    Text,
    RichText,
    DateField,
    Image,
} from '@sitecore-content-sdk/nextjs';
import { BlogDetailProps } from './BlogDetail.types';

const BlogDetail = (props: BlogDetailProps) => {
    const { fields } = props;

    return (
        <article className="blog-detail max-w-3xl mx-auto px-4 py-8">

            {/* Title */}
            <h1 className="text-3xl font-bold mb-4">
                <Text field={fields.Title} />
            </h1>

            {/* Meta */}
            <div className="meta text-sm text-gray-500 flex gap-4 mb-4">
                {fields.Author && (
                    <span>
                        By <Text field={fields.Author} />
                    </span>
                )}
            </div>

            {/* Categories */}
            {fields.Categories?.value?.length > 0 && (
                <div className="categories flex flex-wrap gap-2 mb-6">
                    {fields.Categories.value.map((cat, idx) => (
                        <span
                            key={idx}
                            className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                            {typeof cat === 'string' ? cat : cat}
                        </span>
                    ))}
                </div>
            )}

            {/* Image */}
            {fields.Image && (
                <div className="mb-6">
                    <Image field={fields.Image} className="w-full rounded-lg" />
                </div>
            )}

            {/* Content */}
            <div className="content prose max-w-none">
                <RichText field={fields.Content} />
            </div>
        </article>
    );
};

export default BlogDetail;