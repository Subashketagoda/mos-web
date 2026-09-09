import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'mosphere-luxury-secret-key-change-in-production-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Salon Information
  salonName: process.env.SALON_NAME || 'Mosphere Luxury Salon',
  salonPhone: process.env.SALON_PHONE || '+94 77 729 1629',
  salonWhatsApp: process.env.SALON_WHATSAPP || '94777291629',
  salonEmail: process.env.SALON_EMAIL || 'concierge@mosphere.lk',
  salonTimezone: process.env.SALON_TIMEZONE || 'Asia/Colombo',
  salonAddress: process.env.SALON_ADDRESS || '422A Nawala Rd, Rajagiriya, Sri Lanka',

  // Google Calendar Integration
  googleCalendar: {
    calendarId: process.env.GOOGLE_CALENDAR_ID || '',
    clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL || '',
    privateKey: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    keyFilePath: process.env.GOOGLE_KEY_FILE_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
    // Optional OAuth credentials if preferred over Service Account
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
    // Fallback mode if credentials are missing
    isConfigured: function() {
      return Boolean(
        this.calendarId && 
        ((this.clientEmail && this.privateKey) || this.keyFilePath || (this.clientId && this.refreshToken))
      );
    }
  }
};
