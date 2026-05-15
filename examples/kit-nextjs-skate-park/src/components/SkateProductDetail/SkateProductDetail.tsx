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
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8 font-medium">
          <a href="/" className="hover:text-blue-600 transition-colors">Home</a>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6" /></svg>
          <a href="/products" className="hover:text-blue-600 transition-colors">Products</a>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6" /></svg>
          <span className="text-gray-900 font-bold truncate">{product?.modelName ?? "Sample product"}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          <SkateProductGallery
            images={(product?.images ?? []) as string[]}
            modelName={product?.modelName}
          />

          <div className="flex flex-col">
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tight">
                {product?.modelName ?? "Sample product"}
              </h1>

              <div className="flex items-center gap-6">
                <div className="text-4xl font-bold text-blue-600">
                  ${product?.price?.toLocaleString() ?? "999.999".toLocaleString()}
                </div>
                <div className="h-8 w-px bg-gray-200" />
                {product?.quantity > 0 ? (
                  <div className="flex items-center gap-2 text-emerald-600">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-sm font-bold uppercase tracking-widest">In Stock</span>
                  </div>
                ) : (
                  <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full uppercase tracking-wider">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            <div className="prose prose-blue prose-lg max-w-none mb-12 text-gray-600 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: product?.descriptionHtml || 'No description available' }} />
            </div>

            <div className="space-y-6 mt-auto">
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

              <div className="grid grid-cols-2 gap-4" style={{ display: 'none' }}>
                <button className="py-4 px-4 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-200 hover:text-blue-600 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                  Wishlist
                </button>
                <button className="py-4 px-4 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-200 hover:text-blue-600 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  Ask Expert
                </button>
              </div>
            </div>

            <div className="pt-5 border-t border-gray-50 grid grid-cols-2 gap-8">
              <div className="flex gap-4 group">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">2-Year Warranty</h4>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">Official SkatePark</p>
                </div>
              </div>
              <div className="flex gap-4 group">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" /><polyline points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Fast Shipping</h4>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">Same-Day Delivery</p>
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
