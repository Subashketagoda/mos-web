import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { salonConfig } from '@/lib/config';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'MOSPHERE | Luxury Beauty & Hair Salon in Colombo',
  description: 'Experience refined beauty, precision hair architecture, and bespoke aesthetic rituals at Mosphere. Located at 422A Nawala Rd, Sri Jayawardenepura Kotte, Sri Lanka.',
  keywords: [
    'Mosphere',
    'Salon Colombo',
    'Luxury Hair Salon Sri Lanka',
    'Nawala Beauty Salon',
    'Hair Architecture',
    'Facial Colombo',
    'Balayage Sri Lanka',
    'Grooming Studio'
  ],
  authors: [{ name: 'MOSPHERE' }],
  creator: 'MOSPHERE',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mosphere.lk',
    title: 'MOSPHERE | Luxury Beauty & Hair Salon in Colombo',
    description: 'A modern beauty experience designed around you. Real-time online appointment scheduling directly with our concierge.',
    siteName: 'MOSPHERE',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Mosphere Salon Colombo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MOSPHERE | Luxury Beauty & Hair Salon in Colombo',
    description: 'Bespoke beauty & grooming at 422A Nawala Rd, Sri Jayawardenepura Kotte. Book online with real-time Google Calendar sync.',
    images: ['https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80'],
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#070709',
};

import SmoothScroll from '@/components/SmoothScroll';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: 'MOSPHERE',
    description: 'High-end beauty and lifestyle salon in Colombo, Sri Lanka.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    telephone: salonConfig.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '422A Nawala Rd',
      addressLocality: 'Sri Jayawardenepura Kotte',
      postalCode: '10107',
      addressCountry: 'LK',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '6.8918',
      longitude: '79.8893',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '10:00',
        closes: '20:00',
      },
    ],
    priceRange: 'LKR 3,500 - 25,000',
    sameAs: [
      salonConfig.instagram,
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${plusJakarta.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-mosphere-black text-mosphere-cream font-sans antialiased selection:bg-mosphere-gold selection:text-mosphere-black"
      >
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
