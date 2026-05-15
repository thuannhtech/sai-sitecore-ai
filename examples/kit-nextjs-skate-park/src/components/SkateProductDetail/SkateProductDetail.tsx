import React, { JSX } from 'react';
import { ProductDetail } from 'src/lib/products';
import { SkateAddToCartButton } from '../SkateCart/SkateAddToCartButton';
import { SkateProductGallery } from './SkateProductGallery';

interface SkateProductDetailProps {
  params?: {
    styles?: string;
    RenderingIdentifier?: string;
    [key: string]: string | undefined;
  };
  fields?: {
    [key: string]: any;
  };
  product?: ProductDetail;
}

export const Default = (props: SkateProductDetailProps): JSX.Element => {
  const product = props.product || props.fields?.product;
  const { params } = props;

  return (
    <section className={`bg-white overflow-hidden ${params?.styles || ''}`} id={params?.RenderingIdentifier}>
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <nav className="flex items-center gap-2.5 text-base text-gray-400 mb-10 font-medium">
          <a href="/" className="hover:text-blue-600 transition-colors">Home</a>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6" /></svg>
          <a href="/products" className="hover:text-blue-600 transition-colors">Products</a>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6" /></svg>
          <span className="text-gray-900 font-bold truncate">{product?.modelName ?? "Sample product"}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          <SkateProductGallery
            images={(product?.images ?? []) as string[]}
            modelName={product?.modelName}
          />

          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tight">
                {product?.modelName ?? "Sample product"}
              </h1>

              <div className="flex items-center gap-6">
                <div className="text-4xl font-bold text-blue-600">
                  ${product?.price?.toLocaleString() ?? "999.999"}
                </div>
                <div className="h-8 w-px bg-gray-200" />
                {product?.quantity > 0 ? (
                  <div className="flex items-center gap-2.5 text-emerald-600">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-base font-bold uppercase tracking-widest">In Stock</span>
                  </div>
                ) : (
                  <span className="px-4 py-1.5 bg-red-50 text-red-600 text-sm font-bold rounded-full uppercase tracking-wider">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            <div className="prose prose-blue prose-lg max-w-none text-gray-600 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: product?.descriptionHtml || 'No description available' }} />
            </div>

            <div>
              <SkateAddToCartButton
                product={{
                  id: product?.id || 'pdp-mock',
                  orderCloudId: product?.orderCloudId,
                  name: product?.modelName || 'Product',
                  price: product?.price || 0,
                  imageUrl: product?.images?.[0],
                }}
                quantity={1}
                className="w-full py-5 text-xl uppercase font-black rounded-[1.5rem]"
              />
            </div>

            <div className="pt-6 border-t border-gray-100 grid grid-cols-2 gap-6">
              <div className="flex gap-4 group">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900">2-Year Warranty</h4>
                  <p className="text-sm text-gray-400 mt-0.5 uppercase tracking-widest font-semibold">Official SkatePark</p>
                </div>
              </div>
              <div className="flex gap-4 group">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" /><polyline points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900">Fast Shipping</h4>
                  <p className="text-sm text-gray-400 mt-0.5 uppercase tracking-widest font-semibold">Same-Day Delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Default;
