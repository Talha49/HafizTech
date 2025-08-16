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
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <button
            onClick={() => router.push('/products')}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-all duration-300 font-medium"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const inWishlist = isInWishlist(product._id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 mb-8 transition-all duration-300 font-medium"
        >
          <ArrowLeft size={24} />
          Back to Products
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8">
            {/* Product Images */}
            <div className="space-y-6">
              <div className="relative h-[500px] bg-gray-100 rounded-2xl overflow-hidden shadow-inner">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.title}
                    fill
                    className="object-contain p-4 transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400 font-medium">No Image Available</span>
                  </div>
                )}
                {product.quantity === 0 && (
                  <div className="absolute inset-0 bg-red-600 bg-opacity-80 flex items-center justify-center">
                    <span className="text-white font-bold text-3xl tracking-wide">SOLD OUT</span>
                  </div>
                )}
              </div>

              {/* Image Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-24 w-24 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-300 ${
                        selectedImage === index ? 'border-indigo-500 shadow-md' : 'border-gray-200 hover:border-indigo-300'
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
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">{product.title}</h1>
                <p className="text-xl text-gray-600 font-medium">{product.brand} - {product.model}</p>
                {product.variant && (
                  <p className="text-md text-gray-500">Variant: {product.variant}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-5xl font-bold text-indigo-600">₨{product.price}</span>
                <button
                  onClick={handleWishlistToggle}
                  className={`p-4 rounded-full transition-all duration-300 ${
                    inWishlist 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-red-600'
                  } shadow-sm hover:shadow-md`}
                >
                  <Heart size={28} fill={inWishlist ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-md text-gray-600 font-medium">Category: {product.category}</p>
                <p className="text-md text-gray-600 font-medium">
                  Stock: {product.quantity > 0 ? `${product.quantity} available` : 'Out of stock'}
                </p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Description</h3>
                <div className="max-h-80 overflow-y-auto border border-gray-100 rounded-xl bg-gray-50 p-6 shadow-inner">
                  <div 
                    className="prose max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="space-y-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.quantity === 0}
                  className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    product.quantity > 0
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart size={28} />
                  {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>

                <div className="grid grid-cols-2 gap-4 text-center text-md">
                  <div className="p-4 bg-gray-50 rounded-xl shadow-sm">
                    <div className="font-semibold text-gray-800">🚚 Free Shipping</div>
                    <div className="text-gray-600">On orders over $50</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl shadow-sm">
                    <div className="font-semibold text-gray-800">🔒 Secure Payment</div>
                    <div className="text-gray-600">100% secure checkout</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">You might also like</h2>
          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct._id}
                  href={`/products/${relatedProduct._id}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-56">
                    {relatedProduct.images && relatedProduct.images.length > 0 ? (
                      <Image
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.title}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400 font-medium">No Image</span>
                      </div>
                    )}
                    {relatedProduct.quantity === 0 && (
                      <div className="absolute inset-0 bg-red-600 bg-opacity-80 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">SOLD OUT</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{relatedProduct.title}</h3>
                    <p className="text-sm text-gray-600">{relatedProduct.brand} - {relatedProduct.model}</p>
                    <p className="text-md font-bold text-indigo-600 mt-2">₨{relatedProduct.price}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {relatedProduct.quantity > 0 ? `${relatedProduct.quantity} in stock` : 'Out of stock'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 bg-white rounded-xl p-6 shadow-md">
              <p>No related products found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}