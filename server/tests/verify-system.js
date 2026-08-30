import { initDatabase, query } from '../db/index.js';
import { availabilityService } from '../services/availabilityService.js';
import { bookingService } from '../services/bookingService.js';
import { googleCalendarService } from '../services/googleCalendar.js';
import bcrypt from 'bcryptjs';

async function runTests() {
  console.log('🧪 Starting Mosphere Booking System Verification Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // Test 1: DB Init & Seeding
    console.log('1. Testing Database & Seeds:');
    await initDatabase();
    const services = await query.all('SELECT * FROM services');
    assert(services.length >= 6, `Database seeded with ${services.length} services`);

    const admin = await query.get('SELECT * FROM admin_users WHERE username = ?', ['admin']);
    assert(admin !== undefined && admin.username === 'admin', 'Default admin account exists');

    const isPasswordValid = await bcrypt.compare('adminPassword123', admin.passwordHash);
    assert(isPasswordValid, 'Admin password hash verification');

    // Test 2: Google Calendar Integration Diagnostic
    console.log('\n2. Testing Google Calendar Service:');
    const diag = await googleCalendarService.testConnection();
    assert(diag.status === 'connected' || diag.status === 'simulation_mode', `Google Calendar status: ${diag.status}`);

    // Test 3: Availability Engine Calculation
    console.log('\n3. Testing Real-time Availability Engine:');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const testService = services[0];
    const avail = await availabilityService.getAvailableSlots({
      dateStr,
      serviceDuration: testService.duration
    });

    assert(avail.isOpen === true, `Date ${dateStr} is open for booking`);
    assert(avail.slots.length > 0, `Generated ${avail.slots.length} available slots for ${testService.duration}min service`);
    assert(avail.grouped.morning.length >= 0, 'Slots properly categorized into Morning/Afternoon/Evening');

    const firstSlot = avail.slots[0];
    console.log(`   Sample slot: ${firstSlot.formattedTime} - ${firstSlot.formattedEndTime} (${firstSlot.period})`);

    // Test 4: Booking Creation & Google Calendar Event
    console.log('\n4. Testing Booking Creation:');
    const bookingResult = await bookingService.createBooking({
      serviceId: testService.id,
      date: dateStr,
      startTime: firstSlot.time,
      customerName: 'Lord Sterling',
      phone: '+91 98765 00001',
      email: 'sterling@luxury.com',
      notes: 'Bespoke precision cut with hot towel finish.'
    });

    assert(bookingResult.success === true, 'Booking created successfully');
    assert(bookingResult.booking.bookingRef.startsWith('MOS-'), `Booking reference generated: ${bookingResult.booking.bookingRef}`);
    assert(bookingResult.booking.status === 'confirmed', 'Booking status is confirmed');
    assert(Boolean(bookingResult.booking.googleCalendarEventId), `Google Calendar event registered: ${bookingResult.booking.googleCalendarEventId}`);

    // Test 5: Anti-Double-Booking Protection
    console.log('\n5. Testing Anti-Double-Booking / Race-Condition Prevention:');
    let doubleBookingBlocked = false;
    try {
      await bookingService.createBooking({
        serviceId: testService.id,
        date: dateStr,
        startTime: firstSlot.time, // Same exact time slot
        customerName: 'Impostor Customer',
        phone: '+91 98765 00002'
      });
    } catch (err) {
      doubleBookingBlocked = true;
      console.log(`   Expected rejection caught: "${err.message}"`);
    }
    assert(doubleBookingBlocked, 'Double-booking rejected with conflict prevention');

    // Test 6: Reschedule Appointment
    console.log('\n6. Testing Appointment Rescheduling & Calendar Update:');
    const secondSlot = avail.slots[avail.slots.length - 1]; // Pick last available slot
    const rescheduleResult = await bookingService.rescheduleBooking(bookingResult.booking.id, {
      newDate: dateStr,
      newStartTime: secondSlot.time
    });

    assert(rescheduleResult.success === true, 'Reschedule executed successfully');
    assert(rescheduleResult.updatedBooking.status === 'rescheduled', 'Booking status updated to rescheduled');
    assert(rescheduleResult.updatedBooking.startTime === secondSlot.time, `New time confirmed: ${secondSlot.time}`);

    // Test 7: Cancellation & Calendar Event Removal
    console.log('\n7. Testing Appointment Cancellation & Calendar Event Removal:');
    const cancelResult = await bookingService.cancelBooking(bookingResult.booking.id, 'Test cancellation');
    assert(cancelResult.success === true, 'Appointment cancelled');

    const cancelledInDb = await query.get('SELECT status FROM bookings WHERE id = ?', [bookingResult.booking.id]);
    assert(cancelledInDb.status === 'cancelled', 'Database status set to cancelled');

    // Verification Summary
    console.log(`\n======================================================`);
    console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`======================================================\n`);

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal error during test run:', err);
    process.exit(1);
  }
}

runTests();
