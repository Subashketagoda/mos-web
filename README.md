<<<<<<< HEAD
# mos-web
=======
# 💈 Mosphere — Haute Grooming & Luxury Appointment Booking Platform

A complete, production-grade appointment booking system built for **Mosphere** with secure server-side **Google Calendar API v3** integration, a real-time availability engine, anti-double-booking protection, luxury client UI, and an administrative concierge portal.

---

## 🌟 Highlights

- **🔒 Secure Server-Side Google Calendar API v3**: Never exposes private keys or OAuth secrets in frontend code. Uses official `@googleapis/calendar` with Service Account JWT credentials.
- **⚡ Real-Time Availability & Anti-Double-Booking Engine**: Computes genuine available slots by merging Google Calendar busy events, local SQLite bookings, business hours, service durations, buffer times, and weekly closed days.
- **🛡️ Concurrency & Race-Condition Lock**: Atomic verification right before calendar event creation ensures two concurrent users cannot book the same slot.
- **✨ Luxury Mosphere Aesthetics**: Obsidian Black (`#09090B`), Champagne Gold (`#D4AF37`), Warm Cream, glassmorphism, responsive mobile-first calendar, and sticky booking CTAs.
- **📱 Instant Customer Actions**: Post-booking confirmation screen with 1-click **"Add to Google Calendar"**, **"Download .ICS"**, and **"WhatsApp Concierge"** buttons with auto-populated messages.
- **👑 Full Admin Concierge Suite**: Protected dashboard to view today's schedule, filter appointments, reschedule with live calendar sync, cancel with calendar removal, edit services & prices, configure business hours, and diagnose Google Calendar API status.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```
- **Customer Booking Portal**: `http://localhost:3000`
- **Admin Concierge Portal**: `http://localhost:3000/admin.html`
  - **Default Username**: `admin`
  - **Default Password**: `adminPassword123`

### 3. Run Automated Tests
```bash
# Run unit & logic verification tests
npm test

# Run live E2E HTTP API tests
node server/tests/e2e-http-test.js
```

---

## 📅 Google Calendar API Integration Setup

Follow the detailed step-by-step instructions in [GOOGLE_CALENDAR_SETUP.md](./GOOGLE_CALENDAR_SETUP.md).

### Summary of Google Cloud Steps:
1. Enable **Google Calendar API** in your Google Cloud Console.
2. Create a **Service Account** and download its JSON private key.
3. In Google Calendar, share your calendar with the Service Account email and grant **"Make changes to events"** permission.
4. Copy the Calendar ID and set the environment variables in `.env`:
   ```env
   GOOGLE_CALENDAR_ID="your-calendar-id@group.calendar.google.com"
   GOOGLE_SERVICE_ACCOUNT_EMAIL="your-bot@project-id.iam.gserviceaccount.com"
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```
5. Check connection status live in the Admin Portal under the **"Google Calendar"** tab.

---

## 📁 Project Architecture

```
mos websit/
├── .env.example                     # Environment configuration template
├── .env                             # Local environment variables
├── .gitignore                       # Protects secrets and database
├── GOOGLE_CALENDAR_SETUP.md         # Step-by-step Google Cloud guide
├── README.md                        # Project documentation
├── package.json                     # Scripts and dependencies
├── data/
│   └── mosphere.db                  # Local SQLite database
├── server/
│   ├── index.js                     # Express app & static server
│   ├── config.js                    # Config parser & environment validation
│   ├── db/
│   │   └── index.js                 # SQLite connection & schema migrations
│   ├── middleware/
│   │   └── auth.js                  # Admin JWT authentication
│   ├── routes/
│   │   └── api/
│   │       ├── services.js          # Services CRUD & public catalog
│   │       ├── bookings.js          # Customer booking & availability API
│   │       └── admin.js             # Admin analytics, appointments, settings
│   ├── services/
│   │   ├── googleCalendar.js        # Google Calendar API v3 client & fallback
│   │   ├── availabilityService.js   # Real-time slot calculation & buffer logic
│   │   └── bookingService.js        # Booking lifecycle & mutex lock
│   └── tests/
│       ├── verify-system.js         # Logic & unit verification test
│       └── e2e-http-test.js         # Live HTTP integration test suite
└── public/
    ├── index.html                   # Luxury customer booking wizard
    ├── admin.html                   # Admin concierge dashboard
    ├── css/
    │   ├── style.css                # Luxury client stylesheet
    │   └── admin.css                # Admin portal styling
    └── js/
        ├── app.js                   # Client booking application script
        └── admin.js                 # Admin portal management script
```

---

## 🔐 API Reference

### Public Endpoints
- `GET /api/services`: List active services with pricing & duration.
- `GET /api/availability?date=YYYY-MM-DD&serviceId=...`: Get calculated real-time slots.
- `POST /api/bookings`: Create confirmed appointment with Google Calendar sync.
- `GET /api/bookings/ref/:bookingRef`: Look up booking details by reference code.

### Admin Endpoints (Requires `Authorization: Bearer <token>`)
- `POST /api/admin/login`: Staff login.
- `GET /api/admin/stats`: Metrics, today count, total revenue, upcoming bookings.
- `GET /api/admin/appointments`: List appointments with date, status, and keyword filters.
- `PUT /api/admin/appointments/:id/reschedule`: Reschedule and update Google Calendar.
- `DELETE /api/admin/appointments/:id`: Cancel and remove from Google Calendar.
- `GET /api/admin/calendar/status`: Diagnostic check for Google Calendar API.
- `GET /api/admin/settings` & `PUT /api/admin/settings`: Manage opening hours, buffer time, closed days.
>>>>>>> 8f67e33 (feat: complete MOSPHERE multi-location luxury website with Colombo and Negombo branches, booking engine, and official branding)
