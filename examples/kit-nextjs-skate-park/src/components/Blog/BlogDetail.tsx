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
        <article className="blog-detail mx-auto py-8" style={{ maxWidth: '1200px', padding: "20px" }}>

            {/* Title */}
            <h1 className="text-3xl font-bold mb-5">
                <Text field={fields.Title} />
            </h1>

            {/* Meta Row */}
            <div className="meta flex flex-wrap items-center gap-3 text-md text-gray-500 mb-6">

                {/* Author */}
                {fields.Author && (
                    <span className="flex items-center gap-1">
                        ✍️ <Text field={fields.Author} />
                    </span>
                )}

                {/* Divider */}
                {fields.Author && fields.PublishDate?.value && (
                    <span className="hidden sm:inline">•</span>
                )}

                {/* Publish Date */}
                {fields.PublishDate?.value && (
                    <span className="flex items-center gap-1">
                        🗓️ {new Date(fields.PublishDate.value).toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </span>
                )}

                {/* Categories */}
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

            {/* Image */}
            {fields.Image && (
                <div className="mb-6">
                    <Image field={fields.Image} className="w-full rounded-lg" />
                </div>
            )}

            {/* Content */}
            <div className="content prose max-w-none" style={{ fontSize: '16px' }}>
                <RichText field={fields.Content} />
            </div>
        </article>
    );
};

export default BlogDetail;