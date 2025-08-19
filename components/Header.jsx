'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore, useCartStore } from '@/store/useStore';
import { ShoppingCart, Heart, User, Menu, X, Bell, ChevronDown, Sparkles, Zap } from 'lucide-react';
import Image from 'next/image';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [siteSettings, setSiteSettings] = useState({ businessName: 'Hafiz Tech' });
  const { user, isAuthenticated, logout } = useAuthStore();
  const totalItems = useCartStore((state) => state.items.length);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchSiteSettings();
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
    setIsUserDropdownOpen(false);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-slate-900/95 backdrop-blur-xl border-b border-cyan-500/20 shadow-2xl shadow-cyan-500/10' 
          : 'bg-slate-900/90 backdrop-blur-lg'
      }`}>
        {/* Animated top border */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Elite Logo Section */}
            <Link href="/" className="flex items-center space-x-4 group">
              <div className="relative">
                {/* Outer glow effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                
                {/* Main logo container */}
                <div className="relative w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {siteSettings.headerLogo ? (
                    <Image src={siteSettings.headerLogo} alt="Logo" width={40} height={40} className="rounded-xl relative z-10" />
                  ) : (
                    <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent relative z-10">
                      H
                    </div>
                  )}
                  <Sparkles className="absolute top-1 right-1 w-3 h-3 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
              
              <div className="hidden sm:block">
                <div className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-purple-400 transition-all duration-500">
                  {siteSettings.businessName}
                </div>
                <div className="text-xs text-cyan-400/80 font-bold tracking-widest uppercase flex items-center space-x-1">
                  <Zap size={10} />
                  <span>{siteSettings.slogan ? siteSettings.slogan : 'Elite Store'}</span>
                </div>
              </div>
            </Link>

            {/* Elite Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link href="/products" className="group relative px-6 py-3 text-white/90 hover:text-white font-medium transition-all duration-300 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full group-hover:left-0 transition-all duration-300"></div>
                <span className="relative z-10">Products</span>
              </Link>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-1 ml-6">
                  {/* Elite Wishlist */}
                  <Link href="/wishlist" className="group relative p-3 text-white/80 hover:text-red-400 transition-colors duration-300 rounded-xl hover:bg-red-500/10">
                    <Heart size={24} className="group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-red-400/30 transition-colors duration-300"></div>
                  </Link>

                  {/* Elite Cart */}
                  <Link href="/cart" className="group relative p-3 text-white/80 hover:text-cyan-400 transition-colors duration-300 rounded-xl hover:bg-cyan-500/10">
                    <ShoppingCart size={24} className="group-hover:scale-110 transition-transform duration-300" />
                    {totalItems > 0 && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{totalItems}</span>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-red-500 animate-ping opacity-75"></div>
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-cyan-400/30 transition-colors duration-300"></div>
                  </Link>

                  {/* Elite Notifications */}
                  {/* <button className="group relative p-3 text-white/80 hover:text-green-400 transition-colors duration-300 rounded-xl hover:bg-green-500/10">
                    <Bell size={24} className="group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-green-400/30 transition-colors duration-300"></div>
                  </button> */}

                  {/* Elite User Profile */}
                  <div className="relative ml-4" ref={dropdownRef}>
                    <button
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="group flex items-center space-x-3 pl-4 pr-3 py-2 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/50 hover:border-cyan-500/50 text-white rounded-2xl hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm truncate max-w-24">{user?.name}</div>
                        <div className="text-xs text-cyan-400">{user?.role || 'Member'}</div>
                      </div>
                      <ChevronDown size={16} className={`text-slate-400 transform transition-transform duration-300 ${isUserDropdownOpen ? 'rotate-180 text-cyan-400' : ''}`} />
                    </button>

                    {/* Elite Dropdown */}
                    <div className={`absolute right-0 mt-3 w-64 bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-2xl shadow-2xl shadow-black/50 transform transition-all duration-300 origin-top-right ${
                      isUserDropdownOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                    }`}>
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-t-2xl"></div>
                      
                      <div className="p-4 border-b border-slate-600/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{user?.name}</div>
                            <div className="text-sm text-slate-400">{user?.email}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <Link href="/profile" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 group">
                          <User size={18} className="mr-3 group-hover:text-cyan-400 transition-colors" />
                          Profile Settings
                        </Link>

                        <Link href="/orders" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 group">
                          <ShoppingCart size={18} className="mr-3 group-hover:text-blue-400 transition-colors" />
                          Order History
                        </Link>
                        
                        {user?.role === 'admin' && (
                          <Link href="/admin" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 group">
                            <div className="w-4 h-4 mr-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded group-hover:scale-110 transition-transform"></div>
                            Admin Panel
                          </Link>
                        )}
                        
                        <div className="border-t border-slate-600/50 mt-2 pt-2">
                          <button 
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 group"
                          >
                            <div className="w-4 h-4 mr-3 bg-red-500 rounded group-hover:bg-red-400 transition-colors"></div>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4 ml-6">
                  <Link 
                    href="/auth/login" 
                    className="group relative px-6 py-3 text-white/90 hover:text-white font-medium transition-all duration-300 rounded-xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-700/50 to-slate-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10">Login</span>
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="group relative px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10">Register</span>
                  </Link>
                </div>
              )}
            </nav>

            {/* Elite Mobile Menu Button */}
            <button
              className="md:hidden relative p-3 text-white hover:text-cyan-400 rounded-xl hover:bg-cyan-500/10 transition-all duration-300 border border-slate-600/50 hover:border-cyan-500/50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="relative">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </div>
            </button>
          </div>
        </div>

        {/* Elite Mobile Menu */}
        <div className={`md:hidden transition-all duration-500 ease-out ${
          isMenuOpen 
            ? 'max-h-screen opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="border-t border-slate-600/30 bg-slate-900/98 backdrop-blur-xl">
            <div className="px-4 py-6 space-y-3">
              <Link href="/products" onClick={() => setIsMenuOpen(false)} className="block px-4 py-4 text-white hover:text-cyan-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200 font-medium border border-transparent hover:border-slate-600/50">
                Products
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link href="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-4 text-white hover:text-red-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-600/50">
                    <Heart size={20} className="mr-3" />
                    Wishlist
                  </Link>
                  <Link href="/cart" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-4 text-white hover:text-cyan-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-600/50">
                    <ShoppingCart size={20} className="mr-3" />
                    Cart ({totalItems})
                  </Link>
                  <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-4 text-white hover:text-blue-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-600/50">
                    <User size={20} className="mr-3" />
                    Profile
                  </Link>
                  <Link href="/orders" onClick={() => setIsMenuOpen(false)} className="block px-4 py-4 text-white hover:text-purple-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-600/50">
                    Order History
                  </Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="block px-4 py-4 text-white hover:text-purple-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-600/50">
                      Admin Panel
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 border border-transparent hover:border-red-500/30"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="block px-4 py-4 text-white hover:text-cyan-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200 font-medium border border-transparent hover:border-slate-600/50">
                    Login
                  </Link>
                  <Link href="/auth/register" className="block px-4 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 font-semibold text-center border border-cyan-500/30">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Spacer */}
      <div className="h-20"></div>
    </>
  );
}