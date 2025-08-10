'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCartStore, useWishlistStore } from '@/store/useStore';

export default function ProductCard({ product }) {
  const [imageLoading, setImageLoading] = useState(true);
  const { addItem: addToCart } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  
  const inWishlist = isInWishlist(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.quantity > 0) {
      addToCart(product);
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link href={`/products/${product._id}`}>
        <div className="relative h-64 bg-gray-200">
          {imageLoading && (
            <div className="absolute inset-0 animate-pulse bg-gray-300"></div>
          )}
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            onLoad={() => setImageLoading(false)}
          />
          {product.quantity === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">SOLD OUT</span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg truncate">{product.title}</h3>
          <button
            onClick={handleWishlistToggle}
            className={`p-1 rounded-full transition-colors ${
              inWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        <p className="text-gray-600 text-sm mb-2">{product.brand} - {product.model}</p>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.category}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-indigo-600">₨{product.price}</span>
          <button
            onClick={handleAddToCart}
            disabled={product.quantity === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              product.quantity > 0
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart size={16} />
            <span>{product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
          </button>
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          Stock: {product.quantity > 0 ? product.quantity : 'Out of stock'}
        </div>
      </div>
    </div>
  );
}