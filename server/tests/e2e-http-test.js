// End-to-End HTTP Integration Test for Live Server
async function runE2eTests() {
  console.log('🚀 Running End-to-End HTTP Tests against http://localhost:3000...\n');
  const baseUrl = 'http://localhost:3000';
  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const health = await healthRes.json();
    assert(healthRes.status === 200 && health.status === 'ok', 'GET /api/health returns 200 OK');

    // 2. Fetch static HTML
    const htmlRes = await fetch(`${baseUrl}/`);
    const htmlText = await htmlRes.text();
    assert(htmlRes.status === 200 && htmlText.includes('Mosphere'), 'GET / (Customer Portal) loads successfully');

    // 3. Fetch Admin HTML
    const adminHtmlRes = await fetch(`${baseUrl}/admin.html`);
    const adminHtmlText = await adminHtmlRes.text();
    assert(adminHtmlRes.status === 200 && adminHtmlText.includes('Mosphere Admin'), 'GET /admin.html (Admin Portal) loads successfully');

    // 4. Fetch Services
    const srvRes = await fetch(`${baseUrl}/api/services`);
    const srvData = await srvRes.json();
    assert(srvData.success && srvData.services.length > 0, `GET /api/services returned ${srvData.services.length} services`);
    const service = srvData.services[0];

    // 5. Fetch Availability Slots
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2); // 2 days ahead
    const dateStr = tomorrow.toISOString().split('T')[0];

    const availRes = await fetch(`${baseUrl}/api/availability?date=${dateStr}&serviceId=${service.id}`);
    const availData = await availRes.json();
    assert(availData.success && availData.slots.length > 0, `GET /api/availability for ${dateStr} returned ${availData.totalAvailable} slots`);
    const targetSlot = availData.slots[2]; // Pick 3rd available slot

    // 6. Submit Customer Booking
    const bookingPayload = {
      serviceId: service.id,
      date: dateStr,
      startTime: targetSlot.time,
      customerName: 'Aurelius Vance',
      phone: '+91 98765 99999',
      email: 'aurelius@mosphere.com',
      notes: 'VIP customer, preferred hot towel rinse.'
    };

    const bookRes = await fetch(`${baseUrl}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload)
    });
    const bookData = await bookRes.json();
    assert(bookRes.status === 201 && bookData.success, `POST /api/bookings confirmed booking Ref: ${bookData.booking?.bookingRef}`);
    assert(Boolean(bookData.booking?.addToGoogleCalendarUrl), 'Generated Google Calendar add-to link');
    assert(Boolean(bookData.booking?.whatsappUrl), 'Generated WhatsApp Concierge contact link');

    const createdBooking = bookData.booking;

    // 7. Verify Anti-Double-Booking Protection (Attempt same slot again)
    const duplicateRes = await fetch(`${baseUrl}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload)
    });
    const duplicateData = await duplicateRes.json();
    assert(duplicateRes.status === 409 && duplicateData.success === false, `Anti-Double-Booking prevented duplicate: "${duplicateData.error}"`);

    // 8. Public Booking Reference Lookup
    const refRes = await fetch(`${baseUrl}/api/bookings/ref/${createdBooking.bookingRef}`);
    const refData = await refRes.json();
    assert(refData.success && refData.booking.customerName === 'Aurelius Vance', 'GET /api/bookings/ref/:ref returns booking details');

    // 9. Admin Login
    const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'adminPassword123' })
    });
    const loginData = await loginRes.json();
    assert(loginData.success && Boolean(loginData.token), 'POST /api/admin/login returns JWT token');
    const token = loginData.token;

    // 10. Admin Appointments Retrieval
    const apptsRes = await fetch(`${baseUrl}/api/admin/appointments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const apptsData = await apptsRes.json();
    const found = apptsData.bookings.find(b => b.id === createdBooking.id);
    assert(apptsData.success && Boolean(found), 'GET /api/admin/appointments lists newly created booking');

    // 11. Admin Google Calendar Diagnostics
    const gcalRes = await fetch(`${baseUrl}/api/admin/calendar/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const gcalData = await gcalRes.json();
    assert(gcalData.success && Boolean(gcalData.diagnostic), `GET /api/admin/calendar/status returned: ${gcalData.diagnostic.status}`);

    // 12. Admin Reschedule Appointment
    const newSlot = availData.slots[availData.slots.length - 2];
    const reschedRes = await fetch(`${baseUrl}/api/admin/appointments/${createdBooking.id}/reschedule`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ newDate: dateStr, newStartTime: newSlot.time })
    });
    const reschedData = await reschedRes.json();
    assert(reschedData.success && reschedData.updatedBooking.startTime === newSlot.time, 'PUT /api/admin/appointments/:id/reschedule updated appointment');

    // 13. Admin Cancel Appointment
    const cancelRes = await fetch(`${baseUrl}/api/admin/appointments/${createdBooking.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const cancelData = await cancelRes.json();
    assert(cancelData.success, 'DELETE /api/admin/appointments/:id cancelled appointment and synced with calendar');

    console.log(`\n======================================================`);
    console.log(`📊 E2E Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`======================================================\n`);

    if (failed > 0) process.exit(1);
    else process.exit(0);

  } catch (err) {
    console.error('Fatal E2E test error:', err);
    process.exit(1);
  }
}

runE2eTests();
