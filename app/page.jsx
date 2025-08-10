'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';


export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [siteSettings, setSiteSettings] = useState({ aboutContent: 'Welcome to our amazing e-commerce store!' });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchSiteSettings();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=8');
      if (response.ok) {
        const data = await response.json();
        setFeaturedProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSiteSettings = async () => {
    try {
      const response = await fetch('/api/site-settings');
      if (response.ok) {
        const data = await response.json();
        setSiteSettings(data);
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, featuredProducts.length - 2));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(1, featuredProducts.length - 2)) % Math.max(1, featuredProducts.length - 2));
  };

  const heroImages = [
    'https://images.pexels.com/photos/6214479/pexels-photo-6214479.jpeg',
    'https://images.pexels.com/photos/5632371/pexels-photo-5632371.jpeg',
    'https://images.pexels.com/photos/4464166/pexels-photo-4464166.jpeg'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-r from-blue-600 via-purple-600 to-teal-500 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white z-10">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              Welcome to <span className="text-yellow-300">Hafiz Tech</span>
            </h1>
             <p className="text-xl md:text-2xl mb-8 max-w-2xl animate-fade-in-delay">
               Discover amazing products with unbeatable prices and quality
             </p>
            <Link 
              href="/products" 
              className="inline-block bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Shop Now
            </Link>
          </div>
        </div>
        <div className="absolute inset-0 opacity-20">
          <div 
            className="w-full h-full bg-cover bg-center transition-all duration-1000"
            style={{ backgroundImage: `url(${heroImages[currentSlide % heroImages.length]})` }}
          ></div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">About Us</h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {siteSettings.aboutContent}
          </p>
        </div>
      </section>

      {/* Featured Products Carousel */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600">Discover our top-rated products</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 h-64 rounded-lg mb-4"></div>
                  <div className="bg-gray-300 h-4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-4 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              <div className="relative">
                <div className="overflow-hidden">
                  <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * (100 / 3)}%)` }}
                  >
                    {featuredProducts.map((product) => (
                      <div key={product._id} className="w-1/3 flex-shrink-0 px-3">
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                </div>
                
                {featuredProducts.length > 3 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors z-10"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors z-10"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>
              
              <div className="text-center mt-12">
                <Link 
                  href="/products"
                  className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  View All Products
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No products available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-indigo-600 text-2xl">🚚</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Quick and reliable shipping to your doorstep</p>
            </div>
            
            <div className="text-center p-8 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-green-600 text-2xl">🛡️</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Guarantee</h3>
              <p className="text-gray-600">Premium quality products with warranty</p>
            </div>
            
            <div className="text-center p-8 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-purple-600 text-2xl">💬</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock customer service</p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.3s both;
        }
      `}</style>
    </div>
  );
}