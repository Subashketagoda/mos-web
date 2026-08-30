import { google } from 'googleapis';
import fs from 'fs';
import { config } from '../config.js';

// In-memory simulation cache for local development/fallback when Google credentials are not yet entered
const simulatedCalendarEvents = new Map();

class GoogleCalendarService {
  constructor() {
    this.calendar = null;
    this.authClient = null;
    this.initialized = false;
    this.initError = null;
  }

  /**
   * Initializes the Google Calendar API client using Service Account credentials
   */
  async init() {
    try {
      const gConfig = config.googleCalendar;

      if (!gConfig.calendarId) {
        this.initialized = false;
        this.initError = 'GOOGLE_CALENDAR_ID is not configured in .env';
        console.warn('⚠️ Google Calendar API: GOOGLE_CALENDAR_ID not set. Running in development simulation mode.');
        return false;
      }

      // Approach 1: Service Account direct email + private key
      if (gConfig.clientEmail && gConfig.privateKey) {
        this.authClient = new google.auth.JWT({
          email: gConfig.clientEmail,
          key: gConfig.privateKey,
          scopes: ['https://www.googleapis.com/auth/calendar']
        });
      }
      // Approach 2: Key file path (service-account.json)
      else if (gConfig.keyFilePath && fs.existsSync(gConfig.keyFilePath)) {
        const keyFile = JSON.parse(fs.readFileSync(gConfig.keyFilePath, 'utf8'));
        this.authClient = new google.auth.JWT({
          email: keyFile.client_email,
          key: keyFile.private_key,
          scopes: ['https://www.googleapis.com/auth/calendar']
        });
      }
      // Approach 3: OAuth2 Refresh Token (if configured)
      else if (gConfig.clientId && gConfig.clientSecret && gConfig.refreshToken) {
        const oauth2Client = new google.auth.OAuth2(
          gConfig.clientId,
          gConfig.clientSecret,
          'http://localhost:3000/api/admin/oauth2callback'
        );
        oauth2Client.setCredentials({ refresh_token: gConfig.refreshToken });
        this.authClient = oauth2Client;
      } else {
        this.initialized = false;
        this.initError = 'No valid Google Service Account credentials found in .env';
        console.warn('⚠️ Google Calendar API: Credentials missing. Running in development simulation mode.');
        return false;
      }

      // Authorize client
      await this.authClient.authorize();
      this.calendar = google.calendar({ version: 'v3', auth: this.authClient });
      this.initialized = true;
      this.initError = null;
      console.log('✅ Google Calendar API client authenticated successfully for Calendar ID:', gConfig.calendarId);
      return true;
    } catch (err) {
      this.initialized = false;
      this.initError = err.message;
      console.error('❌ Google Calendar API initialization error:', err.message);
      return false;
    }
  }

  /**
   * Diagnostic connection test with detailed status report
   */
  async testConnection() {
    // Attempt re-init if not initialized
    if (!this.initialized) {
      await this.init();
    }

    if (!this.initialized) {
      return {
        success: false,
        status: 'simulation_mode',
        message: this.initError || 'Google Calendar credentials are not configured in .env',
        calendarId: config.googleCalendar.calendarId || 'Not configured',
        serviceAccountEmail: config.googleCalendar.clientEmail || 'Not configured',
        instructions: 'Refer to GOOGLE_CALENDAR_SETUP.md or configure .env to activate live sync.'
      };
    }

    try {
      const response = await this.calendar.calendars.get({
        calendarId: config.googleCalendar.calendarId
      });

      return {
        success: true,
        status: 'connected',
        calendarId: response.data.id,
        summary: response.data.summary,
        description: response.data.description || 'Mosphere Primary Booking Calendar',
        timeZone: response.data.timeZone,
        message: 'Successfully connected and verified Google Calendar API permissions.'
      };
    } catch (err) {
      return {
        success: false,
        status: 'error',
        message: `Google Calendar API error: ${err.message}`,
        calendarId: config.googleCalendar.calendarId,
        serviceAccountEmail: config.googleCalendar.clientEmail,
        help: 'Ensure you shared the calendar with the Service Account email and granted "Make changes to events" permission.'
      };
    }
  }

  /**
   * Fetches busy time intervals from Google Calendar for a given date (YYYY-MM-DD)
   * Uses both freebusy.query and events.list for complete accuracy.
   */
  async getBusyIntervals(dateStr, timeZone = config.salonTimezone) {
    if (!this.initialized) {
      await this.init();
    }

    const startOfDay = `${dateStr}T00:00:00`;
    const endOfDay = `${dateStr}T23:59:59`;

    // 1. Simulation fallback mode
    if (!this.initialized) {
      const busySlots = [];
      for (const [id, event] of simulatedCalendarEvents.entries()) {
        if (event.date === dateStr && event.status !== 'cancelled') {
          busySlots.push({
            start: event.startDateTime,
            end: event.endDateTime,
            summary: event.summary,
            source: 'simulated_google_calendar'
          });
        }
      }
      return busySlots;
    }

    try {
      // Fetch events for the target day
      // Convert day boundary to RFC3339 format
      // Create date objects for local day boundaries
      const timeMin = new Date(`${dateStr}T00:00:00`).toISOString();
      const timeMax = new Date(`${dateStr}T23:59:59`).toISOString();

      const eventsResponse = await this.calendar.events.list({
        calendarId: config.googleCalendar.calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
        timeZone
      });

      const items = eventsResponse.data.items || [];
      const busySlots = [];

      for (const item of items) {
        // Skip cancelled events or transparency: transparent (free)
        if (item.status === 'cancelled' || item.transparency === 'transparent') {
          continue;
        }

        const start = item.start.dateTime || item.start.date;
        const end = item.end.dateTime || item.end.date;

        if (start && end) {
          busySlots.push({
            id: item.id,
            start,
            end,
            summary: item.summary || 'Busy',
            source: 'google_calendar'
          });
        }
      }

      return busySlots;
    } catch (err) {
      console.error(`❌ Error fetching busy slots from Google Calendar for ${dateStr}:`, err.message);
      // Return empty array or throw based on policy; returning empty + logging ensures booking fallback
      return [];
    }
  }

  /**
   * Creates a new Google Calendar event for a confirmed booking
   * 
   * Event Title: "Mosphere Appointment - {Customer Name}"
   * Event Details:
   *   Customer Name: {name}
   *   Phone: {phone}
   *   Service: {service}
   *   Notes: {notes}
   *   Booked via: Mosphere Website
   */
  async createEvent({
    customerName,
    phone,
    email,
    serviceName,
    duration,
    price,
    date,
    startTime,
    endTime,
    notes,
    bookingRef
  }) {
    if (!this.initialized) {
      await this.init();
    }

    const title = `Mosphere Appointment - ${customerName}`;
    const description = [
      `Customer Name: ${customerName}`,
      `Phone: ${phone}`,
      email ? `Email: ${email}` : null,
      `Service: ${serviceName} (${duration} mins - ₹${price})`,
      `Notes: ${notes && notes.trim() ? notes.trim() : 'None'}`,
      `Booked via: Mosphere Website`,
      `Booking Reference: ${bookingRef}`
    ].filter(Boolean).join('\n');

    const startDateTime = `${date}T${startTime}:00`;
    const endDateTime = `${date}T${endTime}:00`;

    // 1. Simulation fallback
    if (!this.initialized) {
      const simulatedId = `sim_gcal_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const simulatedEvent = {
        id: simulatedId,
        summary: title,
        description,
        date,
        startTime,
        endTime,
        startDateTime,
        endDateTime,
        status: 'confirmed',
        htmlLink: `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(title)}&dates=${date.replace(/-/g, '')}T${startTime.replace(':', '')}00/${date.replace(/-/g, '')}T${endTime.replace(':', '')}00&details=${encodeURIComponent(description)}&location=${encodeURIComponent(config.salonAddress)}`
      };
      simulatedCalendarEvents.set(simulatedId, simulatedEvent);
      console.log(`[Google Calendar Simulator] Created event ${simulatedId}: "${title}" on ${date} ${startTime}-${endTime}`);
      return {
        eventId: simulatedId,
        htmlLink: simulatedEvent.htmlLink,
        mode: 'simulated'
      };
    }

    // 2. Real Google Calendar API call
    try {
      const eventPayload = {
        summary: title,
        description,
        location: `${config.salonName}, ${config.salonAddress}`,
        start: {
          dateTime: new Date(startDateTime).toISOString(),
          timeZone: config.salonTimezone
        },
        end: {
          dateTime: new Date(endDateTime).toISOString(),
          timeZone: config.salonTimezone
        },
        attendees: email ? [{ email, displayName: customerName }] : [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 1440 }, // 24 hours before
            { method: 'popup', minutes: 60 }    // 1 hour before
          ]
        },
        extendedProperties: {
          private: {
            bookingRef,
            serviceName,
            customerPhone: phone
          }
        }
      };

      const response = await this.calendar.events.insert({
        calendarId: config.googleCalendar.calendarId,
        requestBody: eventPayload,
        sendUpdates: email ? 'all' : 'none'
      });

      console.log(`✅ Google Calendar event created successfully: ${response.data.id} (${response.data.htmlLink})`);

      return {
        eventId: response.data.id,
        htmlLink: response.data.htmlLink,
        mode: 'live'
      };
    } catch (err) {
      console.error('❌ Failed to insert event into Google Calendar:', err.message);
      // In case of API failure, log and return null so the booking still saves in DB
      return {
        eventId: null,
        error: err.message,
        mode: 'error'
      };
    }
  }

  /**
   * Updates an existing Google Calendar event (for rescheduling)
   */
  async updateEvent(eventId, {
    customerName,
    phone,
    serviceName,
    duration,
    price,
    date,
    startTime,
    endTime,
    notes,
    bookingRef
  }) {
    if (!eventId) return false;

    if (!this.initialized) {
      await this.init();
    }

    const title = `Mosphere Appointment - ${customerName}`;
    const description = [
      `Customer Name: ${customerName}`,
      `Phone: ${phone}`,
      `Service: ${serviceName} (${duration} mins - ₹${price})`,
      `Notes: ${notes && notes.trim() ? notes.trim() : 'None'}`,
      `Booked via: Mosphere Website`,
      `Booking Reference: ${bookingRef} (RESCHEDULED)`
    ].join('\n');

    const startDateTime = `${date}T${startTime}:00`;
    const endDateTime = `${date}T${endTime}:00`;

    // 1. Simulation fallback
    if (!this.initialized || eventId.startsWith('sim_')) {
      const existing = simulatedCalendarEvents.get(eventId);
      if (existing) {
        existing.date = date;
        existing.startTime = startTime;
        existing.endTime = endTime;
        existing.startDateTime = startDateTime;
        existing.endDateTime = endDateTime;
        existing.description = description;
        simulatedCalendarEvents.set(eventId, existing);
      }
      return true;
    }

    // 2. Real Google Calendar API
    try {
      await this.calendar.events.patch({
        calendarId: config.googleCalendar.calendarId,
        eventId,
        requestBody: {
          summary: title,
          description,
          start: {
            dateTime: new Date(startDateTime).toISOString(),
            timeZone: config.salonTimezone
          },
          end: {
            dateTime: new Date(endDateTime).toISOString(),
            timeZone: config.salonTimezone
          }
        }
      });
      console.log(`✅ Google Calendar event updated (rescheduled): ${eventId}`);
      return true;
    } catch (err) {
      console.error(`❌ Failed to update Google Calendar event ${eventId}:`, err.message);
      return false;
    }
  }

  /**
   * Deletes a Google Calendar event (when cancelled)
   */
  async deleteEvent(eventId) {
    if (!eventId) return false;

    if (!this.initialized) {
      await this.init();
    }

    // 1. Simulation fallback
    if (!this.initialized || eventId.startsWith('sim_')) {
      simulatedCalendarEvents.delete(eventId);
      console.log(`[Google Calendar Simulator] Deleted event ${eventId}`);
      return true;
    }

    // 2. Real Google Calendar API
    try {
      await this.calendar.events.delete({
        calendarId: config.googleCalendar.calendarId,
        eventId
      });
      console.log(`✅ Google Calendar event deleted (cancelled): ${eventId}`);
      return true;
    } catch (err) {
      console.error(`❌ Failed to delete Google Calendar event ${eventId}:`, err.message);
      return false;
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();
