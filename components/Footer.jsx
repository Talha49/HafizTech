'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const [siteSettings, setSiteSettings] = useState({ businessName: 'Hafiz Tech' });

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

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Image src={siteSettings.footerLogo} alt="Logo" width={20} height={20} />
            <h3 className="text-2xl font-bold mb-4">{siteSettings.businessName}</h3>
            <p className="text-gray-400 mb-4">
              Your trusted partner for quality products and exceptional service.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-gray-400 hover:text-white transition-colors">Products</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/returns" className="text-gray-400 hover:text-white transition-colors">Returns</Link></li>
              <li><Link href="/shipping" className="text-gray-400 hover:text-white transition-colors">Shipping Info</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 {siteSettings.businessName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}