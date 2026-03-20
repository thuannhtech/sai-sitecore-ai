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
    const isEditing = props?.page?.mode?.isEditing ?? false;

    return (
        <article
            className="blog-detail w-full mx-auto py-8 px-4 md:px-8 lg:px-12"
            style={{ maxWidth: '1200px' }}
        >
            <h1 className="text-3xl md:text-4xl font-bold mb-5">
                <Text field={fields.Title} />
            </h1>

            <div className="meta flex flex-wrap items-center gap-3 text-md text-gray-500 mb-6">
                {fields.Author && (
                    <span className="flex items-center gap-1">
                        ✍️ <Text field={fields.Author} />
                    </span>
                )}

                {fields.Author && fields.PublishDate?.value && (
                    <span className="hidden sm:inline">•</span>
                )}

                {fields.PublishDate && (
                    <span className="flex items-center gap-1">
                        🗓️ {isEditing ? (
                            <DateField field={fields.PublishDate} />
                        ) : (
                            new Date(fields.PublishDate.value).toLocaleDateString('en-US', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                            })
                        )}
                    </span>
                )}

                {fields.Categories?.value?.length > 0 && (
                    <div className="flex flex-wrap gap-2 ml-2">
                        {fields.Categories.value.map((cat, idx) => (
                            <span
                                key={idx}
                                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                            >
                                {typeof cat === 'string' ? cat : cat}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {fields.Image && (
                <div className="mb-6">
                    <Image field={fields.Image} className="w-full rounded-lg" />
                </div>
            )}

            <div className="content prose max-w-none" style={{ fontSize: '16px' }}>
                <RichText field={fields.Content} />
            </div>
        </article>
    );
};

export default BlogDetail;