
'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Import images from the assets folder
import Ab1 from '../../assets/Ab1.jpg';
import Ab2 from '../../assets/AB2.jpg';
import Ab3 from '../../assets/AB3.jpg';

const heroImages = [Ab3, Ab2, Ab1];

// Animation variants for staggered entrance
const imageVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: index * 0.2,
      ease: 'easeOut',
    },
  }),
};

export default function AboutPage() {
  const [siteSettings, setSiteSettings] = useState({ aboutContent: '' });

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
      {heroImages.map((image, index) => (
        <motion.div
          key={index}
          className={`relative w-full ${
            index === 2 ? 'col-span-2 aspect-video' : 'aspect-square'
          } rounded-xl overflow-hidden shadow-lg group p-1 bg-gray-50`} // Added bg-gray-50 and aspect ratios
          initial="hidden"
          animate="visible"
          custom={index}
          variants={imageVariants}
        >
          <Image
            src={image}
            alt={`About image ${index + 1}`}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
        </motion.div>
      ))}
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
