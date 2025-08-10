'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore, useWishlistStore } from '@/store/useStore';
import { Heart, ShoppingCart, ArrowLeft } from 'lucide-react';

export default function ProductDetail({ params }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem: addToCart } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    if (params.id) {
      fetchProduct();
      fetchRelatedProducts();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        router.push('/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await fetch(`/api/products/related/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setRelatedProducts(Array.isArray(data) ? data : (data?.products || []));
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleAddToCart = () => {
    if (product && product.quantity > 0) {
      addToCart(product);
      alert('Product added to cart!');
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <button
            onClick={() => router.push('/products')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const inWishlist = isInWishlist(product._id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
                {product.quantity === 0 && (
                  <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">SOLD OUT</span>
                  </div>
                )}
              </div>

              {/* Image Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                        selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                <p className="text-lg text-gray-600">{product.brand} - {product.model}</p>
                {product.variant && (
                  <p className="text-md text-gray-500">Variant: {product.variant}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-4xl font-bold text-blue-600">₨{product.price}</span>
                <button
                  onClick={handleWishlistToggle}
                  className={`p-3 rounded-full transition-colors ${
                    inWishlist 
                      ? 'bg-red-100 text-red-500 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-500'
                  }`}
                >
                  <Heart size={24} fill={inWishlist ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Category: {product.category}</p>
                <p className="text-sm text-gray-600">
                  Stock: {product.quantity > 0 ? `${product.quantity} available` : 'Out of stock'}
                </p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 p-4">
                  <div 
                    className="prose max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.quantity === 0}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold text-lg transition-colors ${
                    product.quantity > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart size={24} />
                  {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>

                <div className="grid grid-cols-2 gap-4 text-center text-sm text-gray-600">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-semibold">🚚 Free Shipping</div>
                    <div>On orders over $50</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-semibold">🔒 Secure Payment</div>
                    <div>100% secure checkout</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct._id}
                  href={`/products/${relatedProduct._id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48">
                    {relatedProduct.images && relatedProduct.images.length > 0 ? (
                      <Image
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                    {relatedProduct.quantity === 0 && (
                      <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">SOLD OUT</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{relatedProduct.title}</h3>
                    <p className="text-sm text-gray-600">{relatedProduct.brand} - {relatedProduct.model}</p>
                    <p className="text-md font-bold text-blue-600 mt-2">₨{relatedProduct.price}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {relatedProduct.quantity > 0 ? `${relatedProduct.quantity} in stock` : 'Out of stock'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600">
              <p>No related products found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}