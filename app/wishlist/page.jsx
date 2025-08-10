'use client';
import { useWishlistStore, useCartStore } from '@/store/useStore';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();

  const handleAddToCart = (product) => {
    if (product.quantity > 0) {
      addToCart(product);
      alert('Product added to cart!');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart size={64} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h1>
          <p className="text-gray-600 mb-6">Save products you love for later!</p>
          <Link
            href="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/products/${product._id}`}>
                <div className="relative h-64 bg-gray-200">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
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
                    onClick={() => removeItem(product._id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                
                <p className="text-gray-600 text-sm mb-2">{product.brand} - {product.model}</p>
                <p className="text-gray-500 text-sm mb-3">{product.category}</p>
                
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">₨{product.price}</span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.quantity === 0}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                      product.quantity > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
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
          ))}
        </div>
      </div>
    </div>
  );
}