import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Hafiz Tech - Premium E-Commerce Store',
  description: 'Your trusted partner for quality products and exceptional service.',
  keywords: [
    'Hafiz Tech',
    'Premium E-Commerce Store',
    'Buy electronics online',
    'Best tech products',
    'Online shopping Pakistan',
    'Quality gadgets',
    'Affordable electronics',
    'HafizTech products',
    'HafizTech store',
  ],
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  alternates: {
    canonical: 'https://hafiz-tech.vercel.app/',
  },
  openGraph: {
    title: 'Hafiz Tech - Premium E-Commerce Store',
    description: 'Your trusted partner for quality products and exceptional service.',
    url: 'https://hafiz-tech.vercel.app/',
    siteName: 'Hafiz Tech',
    type: 'website',
    locale: 'en_PK',
    images: [
      {
        url: 'https://hafiz-tech.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Hafiz Tech - Premium E-Commerce Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@hafiztech',
    title: 'Hafiz Tech - Premium E-Commerce Store',
    description: 'Your trusted partner for quality products and exceptional service.',
    images: ['https://hafiz-tech.vercel.app/og-image.jpg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}