'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore, useCartStore } from '@/store/useStore';
import { Search, ShoppingCart, Heart, User, Menu, X,  } from 'lucide-react';
import Image from 'next/image';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState({ businessName: 'Hafiz Tech' });
  const { user, isAuthenticated, logout } = useAuthStore();
  const totalItems = useCartStore((state) => state.items.length);

  useEffect(() => {
    fetchSiteSettings();
  }, []);

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

  const handleLogout = () => {
    logout();
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
          <Image src={siteSettings.headerLogo} alt="Logo" width={20} height={20} />
            <div className="text-2xl font-bold text-indigo-600">
              {siteSettings.businessName}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-700 hover:text-indigo-600 transition-colors">
              Products
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link href="/wishlist" className="text-gray-700 hover:text-indigo-600 transition-colors">
                  <Heart size={24} />
                </Link>
                  <Link href="/cart" className="relative text-gray-700 hover:text-indigo-600 transition-colors">
                  <ShoppingCart size={24} />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 transition-colors">
                    <User size={24} />
                    <span>{user?.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Orders
                    </Link>
                    {user?.role === 'admin' && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Admin Panel
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login" className="text-gray-700 hover:text-indigo-600 transition-colors">
                  Login
                </Link>
                <Link 
                  href="/auth/register" 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/products" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">
                Products
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href="/wishlist" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">
                    Wishlist
                  </Link>
                  <Link href="/cart" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">
                    Cart ({totalItems})
                  </Link>
                  <Link href="/profile" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">
                    Profile
                  </Link>
                  <Link href="/orders" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">
                    Orders
                  </Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">
                      Admin Panel
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-indigo-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">
                    Login
                  </Link>
                  <Link href="/auth/register" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}