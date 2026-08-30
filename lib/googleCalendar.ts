import { google } from 'googleapis';
import fs from 'fs';
import { salonConfig } from './config';

const simulatedCalendarEvents = new Map<string, any>();

class GoogleCalendarService {
  private calendar: any = null;
  private authClient: any = null;
  private initialized = false;
  private initError: string | null = null;

  async init(): Promise<boolean> {
    try {
      const gConfig = salonConfig.googleCalendar;

      if (!gConfig.calendarId) {
        this.initialized = false;
        this.initError = 'GOOGLE_CALENDAR_ID is not configured in .env';
        return false;
      }

      if (gConfig.clientEmail && gConfig.privateKey) {
        this.authClient = new google.auth.JWT({
          email: gConfig.clientEmail,
          key: gConfig.privateKey,
          scopes: ['https://www.googleapis.com/auth/calendar']
        });
      } else if (gConfig.keyFilePath && fs.existsSync(gConfig.keyFilePath)) {
        const keyFile = JSON.parse(fs.readFileSync(gConfig.keyFilePath, 'utf8'));
        this.authClient = new google.auth.JWT({
          email: keyFile.client_email,
          key: keyFile.private_key,
          scopes: ['https://www.googleapis.com/auth/calendar']
        });
      } else {
        this.initialized = false;
        this.initError = 'No valid Google Service Account credentials found in .env';
        return false;
      }

      await this.authClient.authorize();
      this.calendar = google.calendar({ version: 'v3', auth: this.authClient });
      this.initialized = true;
      this.initError = null;
      return true;
    } catch (err: any) {
      this.initialized = false;
      this.initError = err.message;
      return false;
    }
  }

  async testConnection() {
    if (!this.initialized) {
      await this.init();
    }

    if (!this.initialized) {
      return {
        success: false,
        status: 'simulation_mode',
        message: this.initError || 'Google Calendar credentials are not configured in .env',
        calendarId: salonConfig.googleCalendar.calendarId || 'Not configured',
        serviceAccountEmail: salonConfig.googleCalendar.clientEmail || 'Not configured',
        instructions: 'Refer to GOOGLE_CALENDAR_SETUP.md or configure .env to activate live sync.'
      };
    }

    try {
      const response = await this.calendar.calendars.get({
        calendarId: salonConfig.googleCalendar.calendarId
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
    } catch (err: any) {
      return {
        success: false,
        status: 'error',
        message: `Google Calendar API error: ${err.message}`,
        calendarId: salonConfig.googleCalendar.calendarId,
        serviceAccountEmail: salonConfig.googleCalendar.clientEmail,
        help: 'Ensure you shared the calendar with the Service Account email and granted "Make changes to events" permission.'
      };
    }
  }

  async getBusyIntervals(dateStr: string, timeZone: string = salonConfig.timezone) {
    if (!this.initialized) {
      await this.init();
    }

    // Simulation fallback
    if (!this.initialized) {
      const busySlots = [];
      for (const [, event] of simulatedCalendarEvents.entries()) {
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

    // Real Google Calendar API Call
    try {
      const timeMin = new Date(`${dateStr}T00:00:00`).toISOString();
      const timeMax = new Date(`${dateStr}T23:59:59`).toISOString();

      const eventsResponse = await this.calendar.events.list({
        calendarId: salonConfig.googleCalendar.calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
        timeZone
      });

      const items = eventsResponse.data.items || [];
      const busySlots = [];

      for (const item of items) {
        if (item.status === 'cancelled' || item.transparency === 'transparent') {
          continue;
        }

        const start = item.start?.dateTime || item.start?.date;
        const end = item.end?.dateTime || item.end?.date;

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
    } catch (err: any) {
      console.error(`❌ Error fetching busy slots from Google Calendar for ${dateStr}:`, err.message);
      return [];
    }
  }

  async createEvent(booking: {
    customerName: string;
    phone: string;
    email?: string;
    serviceName: string;
    duration: number;
    price: number;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
    bookingRef: string;
  }) {
    if (!this.initialized) {
      await this.init();
    }

    const title = `Mosphere Appointment — ${booking.customerName}`;
    const description = [
      `Customer Name: ${booking.customerName}`,
      `Phone: ${booking.phone}`,
      booking.email ? `Email: ${booking.email}` : null,
      `Service: ${booking.serviceName} (${booking.duration} min - LKR ${booking.price})`,
      `Notes: ${booking.notes && booking.notes.trim() ? booking.notes.trim() : 'None'}`,
      `Booking ID: ${booking.bookingRef}`,
      `Booked through: Mosphere Website`,
      `Location: ${salonConfig.address}`
    ].filter(Boolean).join('\n');

    const startDateTime = `${booking.date}T${booking.startTime}:00`;
    const endDateTime = `${booking.date}T${booking.endTime}:00`;

    // Simulation fallback
    if (!this.initialized) {
      const simulatedId = `sim_gcal_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const simulatedEvent = {
        id: simulatedId,
        summary: title,
        description,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        startDateTime,
        endDateTime,
        status: 'confirmed'
      };
      simulatedCalendarEvents.set(simulatedId, simulatedEvent);
      return { eventId: simulatedId, mode: 'simulated' };
    }

    // Real API Call
    try {
      const eventPayload = {
        summary: title,
        description,
        location: `${salonConfig.name}, ${salonConfig.address}`,
        start: {
          dateTime: new Date(startDateTime).toISOString(),
          timeZone: salonConfig.timezone
        },
        end: {
          dateTime: new Date(endDateTime).toISOString(),
          timeZone: salonConfig.timezone
        },
        attendees: booking.email ? [{ email: booking.email, displayName: booking.customerName }] : [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 1440 },
            { method: 'popup', minutes: 60 }
          ]
        },
        extendedProperties: {
          private: {
            bookingRef: booking.bookingRef,
            serviceName: booking.serviceName,
            customerPhone: booking.phone
          }
        }
      };

      const response = await this.calendar.events.insert({
        calendarId: salonConfig.googleCalendar.calendarId,
        requestBody: eventPayload,
        sendUpdates: booking.email ? 'all' : 'none'
      });

      return {
        eventId: response.data.id,
        htmlLink: response.data.htmlLink,
        mode: 'live'
      };
    } catch (err: any) {
      console.error('❌ Failed to insert event into Google Calendar:', err.message);
      return { eventId: null, error: err.message, mode: 'error' };
    }
  }

  async updateEvent(eventId: string, booking: any) {
    if (!eventId) return false;
    if (!this.initialized) await this.init();

    const title = `Mosphere Appointment — ${booking.customerName}`;
    const startDateTime = `${booking.date}T${booking.startTime}:00`;
    const endDateTime = `${booking.date}T${booking.endTime}:00`;

    if (!this.initialized || eventId.startsWith('sim_')) {
      const existing = simulatedCalendarEvents.get(eventId);
      if (existing) {
        existing.date = booking.date;
        existing.startTime = booking.startTime;
        existing.endTime = booking.endTime;
        existing.startDateTime = startDateTime;
        existing.endDateTime = endDateTime;
        simulatedCalendarEvents.set(eventId, existing);
      }
      return true;
    }

    try {
      await this.calendar.events.patch({
        calendarId: salonConfig.googleCalendar.calendarId,
        eventId,
        requestBody: {
          summary: title,
          start: {
            dateTime: new Date(startDateTime).toISOString(),
            timeZone: salonConfig.timezone
          },
          end: {
            dateTime: new Date(endDateTime).toISOString(),
            timeZone: salonConfig.timezone
          }
        }
      });
      return true;
    } catch (err: any) {
      console.error(`❌ Failed to update Google Calendar event ${eventId}:`, err.message);
      return false;
    }
  }

  async deleteEvent(eventId: string) {
    if (!eventId) return false;
    if (!this.initialized) await this.init();

    if (!this.initialized || eventId.startsWith('sim_')) {
      simulatedCalendarEvents.delete(eventId);
      return true;
    }

    try {
      await this.calendar.events.delete({
        calendarId: salonConfig.googleCalendar.calendarId,
        eventId
      });
      return true;
    } catch (err: any) {
      console.error(`❌ Failed to delete Google Calendar event ${eventId}:`, err.message);
      return false;
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();
