import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { initDatabase } from './db/index.js';
import { googleCalendarService } from './services/googleCalendar.js';
import servicesRouter from './routes/api/services.js';
import bookingsRouter from './routes/api/bookings.js';
import adminRouter from './routes/api/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(publicDir));

// API Routes
app.use('/api/services', servicesRouter);
app.use('/api', bookingsRouter);
app.use('/api/admin', adminRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    salon: config.salonName,
    googleCalendarConfigured: config.googleCalendar.isConfigured()
  });
});

// Fallback for SPA routing
app.get('/admin', (req, res) => {
  res.sendFile(path.join(publicDir, 'admin.html'));
});

app.use((req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error occurred.'
  });
});

// Server bootstrap
async function startServer() {
  try {
    console.log('🏛️ Initializing Mosphere Booking Platform...');
    await initDatabase();
    
    console.log('📅 Initializing Google Calendar Integration...');
    await googleCalendarService.init();

    app.listen(config.port, () => {
      console.log(`\n======================================================`);
      console.log(`✨ Mosphere Booking Platform is live!`);
      console.log(`🌐 Customer Booking Portal: http://localhost:${config.port}`);
      console.log(`🔑 Admin Management Portal: http://localhost:${config.port}/admin.html`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  }
}

startServer();
