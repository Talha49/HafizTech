'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Eye, Heart, Zap, Award, Users, TrendingUp } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [siteSettings, setSiteSettings] = useState({ aboutContent: 'Welcome to our amazing e-commerce store!' });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const typewriterRef = useRef(null);

  const heroTexts = [
    "Welcome to Hafiz Tech",
    "Best Laptops in Pakistan",
    "Premium Quality Laptops",
    "Your Laptop Paradise"
  ];

  const heroImages = [
    'https://images.pexels.com/photos/6214479/pexels-photo-6214479.jpeg',
    'https://images.pexels.com/photos/5632371/pexels-photo-5632371.jpeg',
    'https://images.pexels.com/photos/4464166/pexels-photo-4464166.jpeg',
    'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg',
  ];

  useEffect(() => {
    fetchFeaturedProducts();
    fetchSiteSettings();
    
    // Image rotation
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);

    return () => clearInterval(imageInterval);
  }, []);

  // Typewriter effect
  useEffect(() => {
    const currentText = heroTexts[textIndex];
    let charIndex = 0;
    
    const typeInterval = setInterval(() => {
      if (charIndex <= currentText.length) {
        setDisplayedText(currentText.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          // Clear text and move to next
          setTextIndex((prev) => (prev + 1) % heroTexts.length);
          setDisplayedText('');
        }, 2000);
      }
    }, 100);

    return () => clearInterval(typeInterval);
  }, [textIndex]);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=12');
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
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, Math.ceil(featuredProducts.length / getProductsPerSlide())));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(1, Math.ceil(featuredProducts.length / getProductsPerSlide()))) % Math.max(1, Math.ceil(featuredProducts.length / getProductsPerSlide())));
  };

  const getProductsPerSlide = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 1;
      if (window.innerWidth < 1024) return 2;
      return 4;
    }
    return 4;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Revolutionary Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Animated Background Images */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-2000 ease-in-out ${
                index === currentImageIndex 
                  ? 'opacity-30 scale-100' 
                  : 'opacity-0 scale-110'
              }`}
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ))}
        </div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-purple-900/60 to-teal-900/70"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="floating-element absolute top-20 left-10 w-4 h-4 bg-yellow-400 rounded-full opacity-80"></div>
          <div className="floating-element-delay absolute top-40 right-20 w-3 h-3 bg-pink-400 rounded-full opacity-60"></div>
          <div className="floating-element absolute bottom-32 left-1/4 w-2 h-2 bg-green-400 rounded-full opacity-70"></div>
          <div className="floating-element-delay absolute top-1/3 right-1/3 w-5 h-5 bg-blue-400 rounded-full opacity-50"></div>
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              {/* Animated Badge */}
              <div className="inline-flex items-center px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white text-sm font-medium mb-6 animate-slide-down">
                <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                #1 Tech Store in Pakistan
              </div>

              {/* Typewriter Text */}
              <div className="h-20 flex items-center justify-center">
                <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight">
                  <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
                    {displayedText}
                  </span>
                  <span className="animate-pulse text-yellow-400">|</span>
                </h1>
              </div>

              {/* Subtitle with Animation */}
              <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
                Discover high-performance laptops, competitive prices, and premium quality products for all your computing needs
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                <Link 
                  href="/products" 
                  className="group inline-flex items-center px-8 py-4 bg-yellow-400 text-gray-900 rounded-2xl font-bold text-lg hover:bg-yellow-300 transform hover:scale-105 transition-all duration-300 shadow-2xl"
                >
                  <ShoppingCart className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                  Shop Laptops
                </Link>
                <Link 
                  href="/about" 
                  className="inline-flex items-center px-8 py-4 border-2 border-white/30 text-white rounded-2xl font-semibold text-lg hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Laptops</h2>
            <p className="text-lg text-gray-600">Discover our top-rated laptop collection</p>
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
                    style={{ transform: `translateX(-${currentSlide * (100 / getProductsPerSlide())}%)` }}
                  >
                    {featuredProducts.map((product) => (
                      <div key={product._id} className={`w-full sm:w-1/2 lg:w-1/4 flex-shrink-0 px-3`}>
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                </div>
                
                {featuredProducts.length > getProductsPerSlide() && (
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

      {/* Enhanced Features Section */}
      <section className="py-20 bg-gradient-to-br from-white to-blue-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-blue-600">Hafiz Tech</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the difference with our premium services and commitment to excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition-opacity duration-500"></div>
              <div className="relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <div className="text-white text-3xl">🚚</div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Lightning Fast Delivery</h3>
                <p className="text-gray-600 leading-relaxed">Same-day delivery in major cities with real-time tracking and premium packaging for your precious tech products.</p>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition-opacity duration-500"></div>
              <div className="relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <div className="text-white text-3xl">🛡️</div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Premium Quality Guaranteed</h3>
                <p className="text-gray-600 leading-relaxed">100% authentic products with comprehensive warranty coverage and hassle-free replacement guarantee.</p>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition-opacity duration-500"></div>
              <div className="relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform group-hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <div className="text-white text-3xl">💬</div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">24/7 Expert Support</h3>
                <p className="text-gray-600 leading-relaxed">Round-the-clock technical support from certified experts with instant chat and video assistance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes floating-element {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }

        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.2); }
          66% { transform: translate(-20px, 20px) scale(0.8); }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out 0.5s both;
        }
        
        .animate-slide-down {
          animation: slide-down 0.8s ease-out;
        }
        
        .floating-element {
          animation: floating-element 6s ease-in-out infinite;
        }
        
        .floating-element-delay {
          animation: floating-element 6s ease-in-out infinite 2s;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .transition-2000 {
          transition-duration: 2000ms;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}