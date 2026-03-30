import React from 'react';
import {
    NextImage as Image,
    Link,
    Text,
    RichText,
    Field,
    ImageField,
    LinkField,
} from '@sitecore-content-sdk/nextjs';

interface MultiPromoItem {
    id: string;
    heading: { jsonValue: Field<string> };
    image: { jsonValue: ImageField };
    link: { jsonValue: LinkField };
    description: { jsonValue: Field<string> };
}

interface MultiPromoFields {
    data: {
        datasource: {
            title: { jsonValue: Field<string> };
            description?: { jsonValue: Field<string> };
            children?: {
                results: MultiPromoItem[];
            };
        };
    };
}

type MultiPromo2BlockProps = {
    params: { [key: string]: string };
    fields: MultiPromoFields;
};

export const MultiPromo2Block: React.FC<MultiPromo2BlockProps> = ({
    params = {},
    fields,
}) => {
    if (!fields?.data?.datasource) return null;

    const { title, description, children } = fields.data.datasource;
    const items = children?.results || [];

    const styles = `${params?.GridParameters || ''} ${params?.styles || ''}`.trim();
    const id = params?.RenderingIdentifier || undefined;

    return (
        <section
            className={`component multi-promo-2-block py-20 px-6 bg-[#0a0a0a] text-white ${styles}`.trim()}
            id={id}
        >
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                {(title?.jsonValue?.value || description?.jsonValue?.value) && (
                    <div className="mb-16 text-center">
                        {title?.jsonValue?.value && (
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-6 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 bg-clip-text text-transparent">
                                <Text field={title.jsonValue} />
                            </h2>
                        )}
                        {description?.jsonValue?.value && (
                            <div className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-light leading-relaxed">
                                <RichText field={description.jsonValue} />
                            </div>
                        )}
                        <div className="mt-8 flex justify-center">
                            <div className="h-1 w-24 bg-orange-500 rounded-full" />
                        </div>
                    </div>
                )}

                {/* Promo Blocks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
                    {items.slice(0, 2).map((item, index) => (
                        <div
                            key={item.id || index}
                            className="group relative flex flex-col bg-[#161616] rounded-[2rem] overflow-hidden border border-white/5 hover:border-orange-500/50 transition-all duration-500 shadow-2xl hover:-translate-y-2 hover:shadow-orange-500/10"
                        >
                            {/* Image Container */}
                            <div className="relative aspect-[16/10] overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                                <Image
                                    field={item.image?.jsonValue}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                {/* Link Overlay for entire image */}
                                {item.link?.jsonValue?.value?.href && (
                                    <Link
                                        field={item.link.jsonValue}
                                        className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-sm"
                                    >
                                        <span className="px-8 py-3 bg-white text-black font-bold rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 uppercase tracking-widest text-sm">
                                            Explore More
                                        </span>
                                    </Link>
                                )}
                            </div>

                            {/* Content Container */}
                            <div className="p-8 md:p-10 flex flex-col flex-grow">
                                {item.heading?.jsonValue?.value && (
                                    <h3 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-orange-500 transition-colors duration-300">
                                        <Text field={item.heading.jsonValue} />
                                    </h3>
                                )}

                                {item.description?.jsonValue?.value && (
                                    <div className="text-gray-400 text-base md:text-lg mb-8 line-clamp-3 leading-relaxed">
                                        <RichText field={item.description.jsonValue} />
                                    </div>
                                )}

                                <div className="mt-auto pt-6 border-t border-white/10">
                                    {item.link?.jsonValue?.value?.href && (
                                        <Link
                                            field={item.link.jsonValue}
                                            className="inline-flex items-center text-orange-500 font-semibold group/link"
                                        >
                                            <span className="mr-2 uppercase tracking-widest text-xs">View Details</span>
                                            <svg
                                                className="w-4 h-4 transform group-hover/link:translate-x-2 transition-transform duration-300"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Fill empty state if no items */}
                {items.length === 0 && (
                    <div className="bg-[#161616] p-20 rounded-[2rem] text-center border-2 border-dashed border-white/10">
                        <p className="text-gray-500 text-xl font-medium uppercase tracking-widest">Add Promo Items in Sitecore</p>
                    </div>
                )}
            </div>
        </section>
    );
};