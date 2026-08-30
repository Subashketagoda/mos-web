export interface BranchConfig {
  id: 'colombo' | 'negombo';
  name: string;
  shortName: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  theme: 'urban-noir' | 'emerald-gold';
  address: string;
  addressFull: string;
  phone: string;
  phoneSecondary: string;
  phoneInternational: string;
  whatsapp: string;
  openingHoursGents: string;
  openingHoursLadies: string;
  openingHoursSummary: string;
  googleMapsUrl: string;
  googleMapsEmbed: string;
  instagram: string;
  instagramHandle: string;
  heroImage: string;
  experienceImage: string;
}

export const salonConfig = {
  name: 'MOSPHERE',
  fullName: 'MOSPHERE SALON — Haute Beauty & Precision Grooming',
  motto: 'GRAB LIFE',
  logo: '/images/mosphere-logo.png',
  logoGold: '/images/mosphere-logo-gold.png',
  emblem: '/images/mosphere-emblem-gold.png',
  description: 'Sri Lanka’s premier destination for Hair Botox, Keratin Silk Treatments, Precision Fade Architecture, Balayage, and Bespoke Aesthetic Care.',
  
  // Shared Contacts
  phone: '0777 29 16 29',
  phoneSecondary: '077 881 77 42',
  whatsapp: '94777291629',
  email: 'concierge@mosphere.lk',
  timezone: 'Asia/Colombo',
  address: '422A Nawala Rd, Rajagiriya, Sri Lanka',
  openingHoursGents: '10:00 AM – 8:00 PM',
  openingHoursLadies: '10:00 AM – 7:00 PM',
  googleMapsUrl: 'https://maps.google.com/?q=422A+Nawala+Rd,+Rajagiriya,+Sri+Lanka',
  instagram: 'https://www.instagram.com/mosphere_nawala/',
  instagramHandle: '@mosphere_nawala',

  // Locations Configuration
  locations: {
    colombo: {
      id: 'colombo',
      name: 'COLOMBO / NAWALA',
      shortName: 'NAWALA',
      tagline: 'HAUTE BEAUTY & PRECISION GROOMING',
      heroHeadline: 'A MODERN BEAUTY EXPERIENCE',
      heroSubheadline: 'Urban Haute Sanctuary in Rajagiriya',
      theme: 'urban-noir',
      address: '422A Nawala Rd, Rajagiriya',
      addressFull: '422A Nawala Rd, Sri Jayawardenepura Kotte 10107, Sri Lanka',
      phone: '0777 29 16 29',
      phoneSecondary: '077 881 77 42',
      phoneInternational: '+94777291629',
      whatsapp: '94777291629',
      openingHoursGents: '10:00 AM – 8:00 PM',
      openingHoursLadies: '10:00 AM – 7:00 PM',
      openingHoursSummary: 'Gents: 10 AM – 8 PM • Ladies: 10 AM – 7 PM Daily',
      googleMapsUrl: 'https://maps.google.com/?q=422A+Nawala+Rd,+Rajagiriya,+Sri+Lanka',
      googleMapsEmbed: 'https://maps.google.com/maps?q=422A+Nawala+Rd,+Rajagiriya,+Sri+Lanka&t=&z=16&ie=UTF8&iwloc=&output=embed',
      instagram: 'https://www.instagram.com/mosphere_nawala/',
      instagramHandle: '@mosphere_nawala',
      heroImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=2400&q=85',
      experienceImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=2400&q=85',
    } as BranchConfig,

    negombo: {
      id: 'negombo',
      name: 'NEGOMBO',
      shortName: 'NEGOMBO',
      tagline: 'TROPICAL LUXURY & BESPOKE CARE',
      heroHeadline: 'YOUR BEAUTY. YOUR EXPERIENCE.',
      heroSubheadline: 'Coastal Sanctuary of Haute Aesthetics',
      theme: 'emerald-gold',
      logo: '/images/mosphere-negombo-logo.png',
      emblem: '/images/mosphere-emblem-gold.png',
      address: '51 Galison Mawatha, Negombo',
      addressFull: '51 Galison Mawatha, Negombo 11500, Sri Lanka',
      phone: '0777 29 16 29',
      phoneSecondary: '077 881 77 42',
      phoneInternational: '+94777291629',
      whatsapp: '94777291629',
      openingHoursGents: '10:00 AM – 8:00 PM',
      openingHoursLadies: '10:00 AM – 8:00 PM',
      openingHoursSummary: 'Open Daily: 10:00 AM – 8:00 PM',
      googleMapsUrl: 'https://maps.google.com/?q=51+Galison+Mawatha,+Negombo,+Sri+Lanka',
      googleMapsEmbed: 'https://maps.google.com/maps?q=51+Galison+Mawatha,+Negombo,+Sri+Lanka&t=&z=16&ie=UTF8&iwloc=&output=embed',
      instagram: 'https://www.instagram.com/mosphere_nawala/',
      instagramHandle: '@mosphere_nawala',
      heroImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=2400&q=85',
      experienceImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=2400&q=85',
    } as BranchConfig,
  },

  // Security & JWT
  jwtSecret: process.env.JWT_SECRET || 'mosphere-colombo-luxury-secret-key-2026',
  jwtExpiresIn: '7d',
  
  // Google Calendar Integration
  googleCalendar: {
    calendarId: process.env.GOOGLE_CALENDAR_ID || '',
    clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL || '',
    privateKey: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    keyFilePath: process.env.GOOGLE_KEY_FILE_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
    isConfigured: function(): boolean {
      return Boolean(
        this.calendarId && ((this.clientEmail && this.privateKey) || this.keyFilePath)
      );
    }
  }
};

