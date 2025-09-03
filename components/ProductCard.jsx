'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Eye, Zap } from 'lucide-react';
import { useAuthStore, useCartStore, useWishlistStore } from '@/store/useStore';

function ProductCard({ product }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const { addItem: addToCart } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const {isAuthenticated } = useAuthStore();

  const inWishlist = isInWishlist(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
  
    if (!isAuthenticated) {
      alert('Please login to add to cart');
      return; // stop here if user not logged in
    }
  
    if (product.quantity > 0) {
      addToCart(product);
    }
  };
  
  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const isLowStock = product.quantity > 0 && product.quantity <= 5;
  const isOutOfStock = product.quantity === 0;

  return (
    <div 
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product._id}`}>
        <div className="relative h-72 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {/* Loading skeleton */}
          {imageLoading && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
          )}
          
          {/* Product Image */}
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className={`object-cover transition-all duration-700 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
            onLoad={() => setImageLoading(false)}
          />
          
          {/* Overlay effects */}
          <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isHovered ? 'opacity-10' : 'opacity-0'
          }`}></div>
          
          {/* Stock status badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {/* Sale badge - highest priority */}
            {product.isOnSale && product.discountPercentage > 0 && (
              <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                SALE {product.discountPercentage}% OFF
              </div>
            )}
            
            {/* Stock status badges */}
            {isLowStock && !product.isOnSale && (
              <div className="flex items-center bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                <Zap className="w-3 h-3 mr-1" />
                Only {product.quantity} left
              </div>
            )}
            {isOutOfStock && (
              <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                SOLD OUT
              </div>
            )}
            {!isOutOfStock && !isLowStock && !product.isOnSale && product.quantity <= 10 && (
              <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                IN STOCK
              </div>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
              inWishlist 
                ? 'bg-red-100 text-red-600 border border-red-200' 
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500 border border-white/50'
            } transform hover:scale-110`}
          >
            <Heart 
              size={16} 
              fill={inWishlist ? 'currentColor' : 'none'}
              className="transition-transform duration-200"
            />
          </button>

          {/* Quick view button - appears on hover */}
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}>
            <div className="bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 shadow-lg">
              <Eye size={14} />
              Quick View
            </div>
          </div>

          {/* Sold out overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-white font-bold text-xl tracking-wider">SOLD OUT</div>
            </div>
          )}
        </div>
      </Link>
      
      {/* Product information */}
      <div className="p-5 space-y-4">
        {/* Brand and model */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
            {product.brand}
          </span>
          <span className="text-xs text-gray-500">{product.model}</span>
        </div>

        {/* Product title */}
        <div>
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 leading-tight group-hover:text-indigo-700 transition-colors">
            {product.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{product.category}</p>
        </div>
        
        {/* Price section */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">₨{product.price?.toLocaleString()}</span>
              {product.isOnSale && product.discountPercentage > 0 && (
                <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">
                  -{product.discountPercentage}%
                </span>
              )}
            </div>
            {product.isOnSale && product.originalPrice && product.originalPrice > product.price && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-400 line-through">₨{product.originalPrice?.toLocaleString()}</span>
                <span className="text-xs font-medium text-green-600">
                  Save ₨{(product.originalPrice - product.price)?.toLocaleString()}
                </span>
              </div>
            )}
            {/* Sale end date */}
            {product.isOnSale && product.saleEndDate && new Date(product.saleEndDate) > new Date() && (
              <div className="text-xs text-red-600 font-medium mt-1">
                Sale ends: {new Date(product.saleEndDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Stock info */}
        <div className="flex items-center justify-between text-sm">
          <span className={`font-medium ${
            isOutOfStock ? 'text-red-500' : isLowStock ? 'text-orange-500' : 'text-green-600'
          }`}>
            {isOutOfStock ? 'Out of stock' : `${product.quantity} in stock`}
          </span>
        </div>

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
            isOutOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg'
          }`}
        >
          <ShoppingCart size={18} />
          <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
}

export default ProductCard;