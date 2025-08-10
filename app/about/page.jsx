'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function AboutPage() {
  const [siteSettings, setSiteSettings] = useState({ aboutContent: '' });
  const heroImages = [
    'https://images.pexels.com/photos/6214479/pexels-photo-6214479.jpeg',
    'https://images.pexels.com/photos/5632371/pexels-photo-5632371.jpeg',
    'https://images.pexels.com/photos/4464166/pexels-photo-4464166.jpeg',
  ];

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const res = await fetch('/api/site-settings');
        if (res.ok) {
          const data = await res.json();
          setSiteSettings(data);
        }
      } catch (e) {
        console.error('Error loading site settings', e);
      }
    };
    fetchSiteSettings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Left: image mosaic */}
          <div className="grid grid-cols-2 gap-4 lg:col-span-1">
            <div className="relative w-full h-56 rounded-xl overflow-hidden shadow">
              <Image src={heroImages[0]} alt="About image 1" fill className="object-cover" />
            </div>
            <div className="relative w-full h-56 rounded-xl overflow-hidden shadow">
              <Image src={heroImages[1]} alt="About image 2" fill className="object-cover" />
            </div>
            <div className="relative w-full h-56 rounded-xl overflow-hidden shadow col-span-2">
              <Image src={heroImages[2]} alt="About image 3" fill className="object-cover" />
            </div>
          </div>

          {/* Right: formatted about content from site settings */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About Us</h1>
            <p className="text-gray-600 mb-6">Learn more about our story, values, and mission.</p>
            <div
              className="prose max-w-none bg-white rounded-xl shadow p-6 border border-gray-100"
              dangerouslySetInnerHTML={{ __html: siteSettings.aboutContent || '' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


