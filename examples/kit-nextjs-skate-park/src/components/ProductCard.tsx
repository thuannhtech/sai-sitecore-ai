import Link from 'next/link';
import type { ProductCard } from '../lib/products';

export default function ProductCard({ p }: { p: ProductCard }) {
  return (
    <Link 
      href={`/products/${p.slug}`} 
      className="block border border-gray-200 p-4 rounded-xl no-underline text-inherit transition-all hover:-translate-y-1 hover:shadow-lg bg-white"
    >
      {p.imageUrl && (
        <img 
          src={p.imageUrl} 
          alt={p.modelName} 
          className="w-full h-auto rounded-lg mb-3" 
        />
      )}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900 leading-tight">
          {p.modelName}
        </h3>
        <p className="text-base text-gray-700 font-medium">
          ${p.price.toLocaleString()}
        </p>
      </div>
    </Link>
  );
}
