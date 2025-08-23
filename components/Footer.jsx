'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Mail, 
  Phone, 
  MapPin, 
  
  ArrowRight, 
  Heart, 
  Zap,
  Shield,
  Truck,
  Star,
  Send
} from 'lucide-react';

import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";


export default function Footer() {
  const [siteSettings, setSiteSettings] = useState({ businessName: 'Hafiz Tech' });
  const [email, setEmail] = useState('');

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

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-slate-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-bounce"></div>
      </div>

      {/* Top gradient border */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* Company Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-md overflow-hidden">
                  {siteSettings.footerLogo ? (
                    <Image
                      src={siteSettings.footerLogo}
                      alt="Logo"
                      width={40}
                      height={40}
                      style={{ objectFit: 'contain' }}
                      className=""
                      sizes="40px"
                      priority
                    />
                  ) : (
                    <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">H</span>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
                    {siteSettings.businessName}
                  </h3>
                  <div className="text-sm text-cyan-400/80 font-bold tracking-widest uppercase flex items-center space-x-1">
                    <Zap size={12} />
                    <span>{siteSettings.slogan ? siteSettings.slogan : 'Premium E-Commerce'}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-slate-300 text-lg leading-relaxed max-w-lg">
                We&apos;re your trusted laptop partner, delivering premium quality products and exceptional service. Visit our shop to experience the latest laptops from leading brands and get expert advice. Enjoy competitive pricing, special offers, and comprehensive warranties. Let us help you find the perfect laptop for your needs!
              </p>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                  <Shield className="text-green-400" size={20} />
                  <span className="text-sm font-medium">Secure Shopping</span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                  <Truck className="text-blue-400" size={20} />
                  <span className="text-sm font-medium">Fast Delivery</span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                  <Star className="text-yellow-400" size={20} />
                  <span className="text-sm font-medium">5-Star Service</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white mb-4">Get in Touch</h4>
                <div className="flex items-center space-x-3 text-slate-300 hover:text-cyan-400 transition-colors">
                  <Mail size={18} className="text-cyan-400" />
                  <span>hafiztech@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300 hover:text-cyan-400 transition-colors">
                  <Phone size={18} className="text-green-400" />
                  <span>03017638491</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300 hover:text-cyan-400 transition-colors">
                  <MapPin size={18} className="text-red-400" />
                  <span>Shop No# 62/11 Atalian Shoes Street, Bank Road Saddar, Rawalpindi, Pakistan</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h4 className="text-xl font-bold text-white">Quick Links</h4>
              <div className="space-y-3">
                {[
                  { name: 'Products', href: '/products' },
                  { name: 'About Us', href: '/about' },
                  { name: 'Contact', href: '/contact' },
                  // { name: 'FAQ', href: '/faq' },
                  // { name: 'Support', href: '/support' },
                  // { name: 'Returns', href: '/returns' }
                ].map((link) => (
                  <Link 
                    key={link.name}
                    href={link.href} 
                    className="group flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition-all duration-300 hover:translate-x-2"
                  >
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{link.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="space-y-6">
            

              {/* Social Links */}
            <div className="space-y-4">
  <h5 className="font-semibold text-white">Follow Us</h5>
  <div className="flex space-x-3">
    {[
      { 
        Icon: FaFacebookF, 
        color: 'hover:text-blue-500', 
        bg: 'hover:bg-blue-500/10', 
        link: 'https://www.facebook.com/HafizTechPk' 
      },
      { 
        Icon: FaInstagram, 
        color: 'hover:text-pink-500', 
        bg: 'hover:bg-pink-500/10', 
        link: 'https://www.instagram.com/hafiz_tech07' 
      },
      { 
        Icon: FaYoutube, 
        color: 'hover:text-red-500', 
        bg: 'hover:bg-red-500/10', 
        link: 'https://www.youtube.com/@hafiz-tech-' 
      },
      { 
        Icon: FaTiktok, 
        color: 'hover:text-black', 
        bg: 'hover:bg-black/10', 
        link: 'https://www.tiktok.com/@hafiztech0' 
      }
    ].map(({ Icon, color, bg, link }, index) => (
      <a 
        key={index} 
        href={link} 
        target="_blank" 
        rel="noopener noreferrer"
      >
        <button
          className={`p-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-400 ${color} ${bg} transition-all duration-300 hover:scale-110 hover:shadow-lg`}
        >
          <Icon size={20} />
        </button>
      </a>
    ))}
  </div>
</div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-700/50 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-slate-400">
              <span>© {currentYear} {siteSettings.businessName}. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Made with</span>
              <Heart size={16} className="text-red-400 animate-pulse hidden sm:inline" />
              <span className="hidden sm:inline">in Pakistan</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <Link href="/privacy" className="text-slate-400 hover:text-cyan-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-cyan-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-slate-400 hover:text-cyan-400 transition-colors">
                Cookie Policy
              </Link>
              <Link href="/sitemap" className="text-slate-400 hover:text-cyan-400 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>


          {/* Back to Top Button */}
          <div className="mt-8 text-center">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/50 hover:border-cyan-500/50 text-slate-300 hover:text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <ArrowRight className="rotate-[-90deg] group-hover:-translate-y-1 transition-transform duration-300" size={16} />
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-50"></div>
    </footer>
  );
}