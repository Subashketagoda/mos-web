const http = require('http');

function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: defaultHeaders,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('MOSPHERE LUXURY SALON — END-TO-END VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✓ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${message}`);
    }
  }

  try {
    // 1. Test Homepage
    console.log('1. Testing Homepage (App Router)...');
    const homeRes = await makeRequest('/');
    assert(homeRes.status === 200, `Homepage returned HTTP ${homeRes.status}`);
    assert(
      homeRes.raw && homeRes.raw.includes('MOSPHERE'),
      'Homepage includes MOSPHERE luxury branding'
    );

    // 2. Test Services API
    console.log('\n2. Testing Public Services Catalog API (/api/services)...');
    const servicesRes = await makeRequest('/api/services');
    assert(servicesRes.status === 200, `Services API returned HTTP 200`);
    assert(
      servicesRes.data?.success && Array.isArray(servicesRes.data.services) && servicesRes.data.services.length >= 6,
      `Loaded ${servicesRes.data?.services?.length} luxury services`
    );

    const firstService = servicesRes.data.services[0];
    console.log(`   Selected service: "${firstService.name}" (${firstService.duration} min, LKR ${firstService.price})`);

    // 3. Test Availability Engine (/api/availability)
    console.log('\n3. Testing Real-Time Availability & Google Calendar Check (/api/availability)...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const availRes = await makeRequest(`/api/availability?date=${dateStr}&serviceId=${firstService.id}`);
    assert(availRes.status === 200, `Availability API returned HTTP 200`);
    assert(availRes.data?.success === true, `Availability response marked success`);
    assert(
      Array.isArray(availRes.data?.slots) && availRes.data.slots.length > 0,
      `Computed ${availRes.data?.slots?.length} available time intervals for ${dateStr}`
    );

    const selectedSlot = availRes.data.slots[0];
    console.log(`   Selected slot: ${selectedSlot.formattedTime} - ${selectedSlot.formattedEndTime}`);

    // 4. Test Customer Booking Engine & Google Calendar Creation (/api/bookings)
    console.log('\n4. Testing Real-Time Booking & Concurrency Lock (/api/bookings)...');
    const bookingPayload = {
      serviceId: firstService.id,
      date: dateStr,
      startTime: selectedSlot.time,
      customerName: 'Sahan Wickramasinghe',
      phone: '077 729 1629',
      email: 'sahan@example.com',
      notes: 'Requested private suite and senior stylist.',
    };

    const bookRes = await makeRequest('/api/bookings', 'POST', bookingPayload);
    assert(bookRes.status === 201, `Booking created with HTTP 201 Created`);
    assert(bookRes.data?.success === true, 'Booking response is success');
    assert(
      bookRes.data?.booking?.bookingRef && bookRes.data.booking.bookingRef.startsWith('MOS-'),
      `Generated unique reference: ${bookRes.data?.booking?.bookingRef}`
    );
    assert(
      bookRes.data?.booking?.addToGoogleCalendarUrl && bookRes.data.booking.addToGoogleCalendarUrl.includes('calendar.google.com'),
      'Generated "Add to Google Calendar" instant link for customer'
    );
    const createdBooking = bookRes.data.booking;

    // 5. Test Anti-Double Booking Prevention (Double Booking Attempt)
    console.log('\n5. Testing Anti-Double Booking & Race-Condition Lock...');
    const duplicateRes = await makeRequest('/api/bookings', 'POST', bookingPayload);
    assert(
      duplicateRes.status === 409,
      `Double-booking correctly rejected with HTTP 409 Conflict: "${duplicateRes.data?.error}"`
    );

    // 6. Test Admin Authentication (/api/admin/login)
    console.log('\n6. Testing Admin Authentication (/api/admin/login)...');
    const loginRes = await makeRequest('/api/admin/login', 'POST', {
      username: 'admin',
      password: 'adminPassword123',
    });
    assert(loginRes.status === 200, `Admin login returned HTTP 200`);
    assert(loginRes.data?.success === true && loginRes.data?.token, 'Received valid Admin JWT');
    const adminToken = loginRes.data.token;

    // 7. Test Admin Stats & Dashboard Metrics (/api/admin/stats)
    console.log('\n7. Testing Admin Dashboard Metrics (/api/admin/stats)...');
    const statsRes = await makeRequest('/api/admin/stats', 'GET', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(statsRes.status === 200, `Admin stats returned HTTP 200`);
    assert(
      statsRes.data?.stats?.upcomingCount >= 1,
      `Upcoming bookings count includes newly created appointment (${statsRes.data?.stats?.upcomingCount})`
    );

    // 8. Test Admin Bookings Query & Filter (/api/admin/bookings)
    console.log('\n8. Testing Admin Bookings Management (/api/admin/bookings)...');
    const adminBookingsRes = await makeRequest(`/api/admin/bookings?search=Sahan`, 'GET', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(adminBookingsRes.status === 200, `Admin bookings query returned HTTP 200`);
    assert(
      adminBookingsRes.data?.bookings?.some((b) => b.id === createdBooking.id),
      `Verified booking ${createdBooking.bookingRef} found in Admin portal`
    );

    // 9. Test Google Calendar Status Diagnostic Tool (/api/admin/calendar/status)
    console.log('\n9. Testing Google Calendar Status & Diagnostic API (/api/admin/calendar/status)...');
    const gcalRes = await makeRequest('/api/admin/calendar/status', 'GET', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(gcalRes.status === 200, `Calendar diagnostic returned HTTP 200`);
    assert(
      gcalRes.data?.diagnostic?.status !== undefined,
      `Google Calendar status verified: ${gcalRes.data?.diagnostic?.status}`
    );

    // 10. Test Reviews API (/api/reviews)
    console.log('\n10. Testing Google Reviews Showcase API (/api/reviews)...');
    const reviewsRes = await makeRequest('/api/reviews');
    assert(reviewsRes.status === 200, `Reviews API returned HTTP 200`);
    assert(
      reviewsRes.data?.reviews?.length >= 3 && reviewsRes.data?.rating === 4.7,
      `Verified Google Reviews (Rating: ${reviewsRes.data?.rating} ★, ${reviewsRes.data?.reviews?.length} testimonials)`
    );

    console.log('\n================================================================');
    console.log(`VERIFICATION SUMMARY: ${passed} / ${total} TESTS PASSED`);
    console.log('================================================================\n');

    if (passed === total) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during test suite:', err);
    process.exit(1);
  }
}

runTests();
