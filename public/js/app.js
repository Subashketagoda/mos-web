/**
 * MOSPHERE LUXURY APPOINTMENT BOOKING SYSTEM - CLIENT APPLICATION
 */

// Application State
const state = {
  services: [],
  categories: ['All'],
  selectedCategory: 'All',
  selectedService: null,
  
  // Date & Calendar State
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  selectedDate: null, // YYYY-MM-DD
  
  // Slots & Availability
  availableSlots: [],
  selectedSlot: null,
  isLoadingSlots: false,
  
  // Settings & Closed Days
  settings: {
    closedDays: [],
    blockedDates: [],
    currency: '₹'
  },
  
  // Customer Details
  customer: {
    name: '',
    phone: '',
    email: '',
    notes: ''
  },
  
  // Confirmed Booking
  confirmedBooking: null,
  currentStep: 1
};

// DOM Elements
const el = {
  servicesGrid: document.getElementById('servicesGrid'),
  categoryFilter: document.getElementById('categoryFilter'),
  calendarDays: document.getElementById('calendarDays'),
  calendarMonthYear: document.getElementById('calendarMonthYear'),
  prevMonthBtn: document.getElementById('prevMonthBtn'),
  nextMonthBtn: document.getElementById('nextMonthBtn'),
  selectedDateLabel: document.getElementById('selectedDateLabel'),
  slotsCountBadge: document.getElementById('slotsCountBadge'),
  slotsContainer: document.getElementById('slotsContainer'),
  
  // Step Panels & Buttons
  wizardSteps: document.querySelectorAll('.wizard-step'),
  stepPanels: document.querySelectorAll('.step-panel'),
  toStep2Btn: document.getElementById('toStep2Btn'),
  toStep3Btn: document.getElementById('toStep3Btn'),
  backToStep1Btn: document.getElementById('backToStep1Btn'),
  backToStep2Btn: document.getElementById('backToStep2Btn'),
  confirmBookingBtn: document.getElementById('confirmBookingBtn'),
  
  // Form Inputs
  inputName: document.getElementById('inputName'),
  inputPhone: document.getElementById('inputPhone'),
  inputEmail: document.getElementById('inputEmail'),
  inputNotes: document.getElementById('inputNotes'),
  
  // Summary Elements
  summaryService: document.getElementById('summaryService'),
  summaryDuration: document.getElementById('summaryDuration'),
  summaryDate: document.getElementById('summaryDate'),
  summaryTime: document.getElementById('summaryTime'),
  summaryTotal: document.getElementById('summaryTotal'),
  
  // Confirmation Elements
  confirmRef: document.getElementById('confirmRef'),
  confirmName: document.getElementById('confirmName'),
  confirmService: document.getElementById('confirmService'),
  confirmDateTime: document.getElementById('confirmDateTime'),
  confirmDuration: document.getElementById('confirmDuration'),
  confirmPrice: document.getElementById('confirmPrice'),
  confirmGcalBtn: document.getElementById('confirmGcalBtn'),
  confirmWhatsAppBtn: document.getElementById('confirmWhatsAppBtn'),
  confirmIcsBtn: document.getElementById('confirmIcsBtn'),
  bookAnotherBtn: document.getElementById('bookAnotherBtn'),
  
  // Mobile CTA
  mobileCta: document.getElementById('mobileCta'),
  mobileCtaService: document.getElementById('mobileCtaService'),
  mobileCtaPrice: document.getElementById('mobileCtaPrice'),
  mobileCtaBtn: document.getElementById('mobileCtaBtn'),
  
  toastContainer: document.getElementById('toastContainer')
};

// Toast Notifications
function showToast(message, type = 'info') {
  if (!el.toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;
  el.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Format Helper: YYYY-MM-DD
function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Format Helper: Friendly Date String (e.g. "Saturday, Aug 29, 2026")
function formatFriendlyDate(dateStr) {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Format Helper: 12hr time format
function format12Hour(timeStr) {
  if (!timeStr) return '-';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

// =========================================================
// 1. INITIALIZATION & DATA FETCHING
// =========================================================

async function initApp() {
  // Set default selected date to today (or tomorrow if late evening)
  const today = new Date();
  state.selectedDate = formatDateISO(today);
  
  await fetchServices();
  setupEventListeners();
  renderCalendar();
}

async function fetchServices() {
  try {
    const res = await fetch('/api/services');
    const data = await res.json();
    if (data.success && data.services.length > 0) {
      state.services = data.services;
      
      // Extract unique categories
      const cats = new Set(['All']);
      data.services.forEach(s => {
        if (s.category) cats.add(s.category);
      });
      state.categories = Array.from(cats);
      
      renderCategories();
      renderServices();
    } else {
      el.servicesGrid.innerHTML = `<div class="no-slots-notice">No active services found.</div>`;
    }
  } catch (err) {
    showToast('Failed to load services. Please refresh.', 'error');
  }
}

// =========================================================
// 2. STEP 1: SERVICES & CATEGORIES
// =========================================================

function renderCategories() {
  if (!el.categoryFilter) return;
  el.categoryFilter.innerHTML = state.categories.map(cat => `
    <button class="filter-chip ${cat === state.selectedCategory ? 'active' : ''}" data-cat="${cat}">
      ${cat}
    </button>
  `).join('');

  el.categoryFilter.querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedCategory = btn.dataset.cat;
      renderCategories();
      renderServices();
    });
  });
}

function renderServices() {
  if (!el.servicesGrid) return;
  
  const filtered = state.selectedCategory === 'All' 
    ? state.services 
    : state.services.filter(s => s.category === state.selectedCategory);

  el.servicesGrid.innerHTML = filtered.map(s => {
    const isSelected = state.selectedService && state.selectedService.id === s.id;
    return `
      <div class="service-card ${isSelected ? 'selected' : ''}" data-id="${s.id}">
        <div>
          <div class="service-header">
            <div>
              <div class="service-category">${s.category || 'Mosphere Bespoke'}</div>
              <h3 class="service-name">${s.name}</h3>
            </div>
          </div>
          <p class="service-description">${s.description || 'Exclusive luxury grooming and styling.'}</p>
        </div>
        <div class="service-footer">
          <div class="service-duration">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>${s.duration} mins</span>
          </div>
          <div class="service-price">₹${s.price}</div>
        </div>
      </div>
    `;
  }).join('');

  el.servicesGrid.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
      const sId = card.dataset.id;
      state.selectedService = state.services.find(s => s.id === sId);
      renderServices();
      updateNavigationState();
      updateMobileCta();
      
      // Auto-fetch slots if date is selected
      if (state.selectedDate) {
        fetchAvailableSlots();
      }
    });
  });
}

// =========================================================
// 3. STEP 2: LUXURY CALENDAR & TIME SLOTS
// =========================================================

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function renderCalendar() {
  if (!el.calendarDays || !el.calendarMonthYear) return;
  
  const month = state.currentMonth;
  const year = state.currentYear;
  
  el.calendarMonthYear.textContent = `${monthNames[month]} ${year}`;
  
  // Disable prev button if viewing past month
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentViewMonthStart = new Date(year, month, 1);
  const currentActualMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  el.prevMonthBtn.disabled = currentViewMonthStart <= currentActualMonthStart;

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun, 1 is Mon...
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let daysHtml = '';

  // Empty placeholder slots for previous month offset
  for (let i = 0; i < firstDayIndex; i++) {
    daysHtml += `<div class="calendar-day empty"></div>`;
  }

  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const dayDate = new Date(year, month, d);
    dayDate.setHours(0, 0, 0, 0);
    const dateIso = formatDateISO(dayDate);
    
    const isPast = dayDate < today;
    const isToday = dayDate.getTime() === today.getTime();
    const isSelected = state.selectedDate === dateIso;

    // Check closed day or blocked
    const dayOfWeek = dayDate.getDay();
    const isClosed = state.settings.closedDays && state.settings.closedDays.includes(dayOfWeek);
    const isBlocked = state.settings.blockedDates && state.settings.blockedDates.includes(dateIso);
    const isDisabled = isPast || isClosed || isBlocked;

    daysHtml += `
      <button 
        type="button"
        class="calendar-day ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}" 
        data-date="${dateIso}"
        ${isDisabled ? 'disabled' : ''}
      >
        ${d}
      </button>
    `;
  }

  el.calendarDays.innerHTML = daysHtml;

  // Add click handlers to active calendar days
  el.calendarDays.querySelectorAll('.calendar-day:not(.disabled):not(.empty)').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedDate = btn.dataset.date;
      state.selectedSlot = null; // reset selected slot when date changes
      renderCalendar();
      fetchAvailableSlots();
      updateNavigationState();
    });
  });

  if (el.selectedDateLabel) {
    el.selectedDateLabel.textContent = formatFriendlyDate(state.selectedDate);
  }
}

async function fetchAvailableSlots() {
  if (!state.selectedDate || !state.selectedService) return;

  state.isLoadingSlots = true;
  el.slotsContainer.innerHTML = `
    <div class="no-slots-notice">
      <div>Checking Google Calendar & salon availability in real time...</div>
    </div>
  `;

  try {
    const res = await fetch(`/api/availability?date=${state.selectedDate}&serviceId=${state.selectedService.id}`);
    const data = await res.json();
    state.isLoadingSlots = false;

    if (data.success && data.isOpen && data.slots.length > 0) {
      state.availableSlots = data.slots;
      el.slotsCountBadge.textContent = `${data.totalAvailable} Slots Available`;
      el.slotsCountBadge.style.display = 'inline-flex';
      renderSlots(data.grouped);
    } else {
      state.availableSlots = [];
      el.slotsCountBadge.style.display = 'none';
      el.slotsContainer.innerHTML = `
        <div class="no-slots-notice">
          <div style="font-weight: 500; color: #fff; margin-bottom: 4px;">No available slots on this date</div>
          <p style="font-size: 13px;">${data.reason || 'All appointments are fully booked or the salon is closed. Please select another date.'}</p>
        </div>
      `;
    }
  } catch (err) {
    state.isLoadingSlots = false;
    el.slotsContainer.innerHTML = `
      <div class="no-slots-notice" style="color: var(--accent-danger);">
        Error loading time slots. Please check your connection.
      </div>
    `;
  }
}

function renderSlots(grouped) {
  let html = '';

  const renderGroup = (title, slots) => {
    if (!slots || slots.length === 0) return '';
    return `
      <div class="slot-period-group">
        <div class="period-title">
          <span>${title}</span>
        </div>
        <div class="slots-grid">
          ${slots.map(s => {
            const isSelected = state.selectedSlot && state.selectedSlot.time === s.time;
            return `
              <button 
                type="button" 
                class="time-slot-btn ${isSelected ? 'selected' : ''}" 
                data-time="${s.time}"
                data-endtime="${s.endTime}"
                data-formatted="${s.formattedTime}"
              >
                ${s.formattedTime}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  };

  html += renderGroup('Morning', grouped.morning);
  html += renderGroup('Afternoon', grouped.afternoon);
  html += renderGroup('Evening', grouped.evening);

  el.slotsContainer.innerHTML = html;

  el.slotsContainer.querySelectorAll('.time-slot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const time = btn.dataset.time;
      state.selectedSlot = state.availableSlots.find(s => s.time === time);
      
      el.slotsContainer.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      
      updateNavigationState();
      updateSummary();
    });
  });
}

// =========================================================
// 4. STEP 3: SUMMARY & CUSTOMER DETAILS
// =========================================================

function updateSummary() {
  if (state.selectedService) {
    el.summaryService.textContent = state.selectedService.name;
    el.summaryDuration.textContent = `${state.selectedService.duration} Minutes`;
    el.summaryTotal.textContent = `₹${state.selectedService.price}`;
  }
  if (state.selectedDate) {
    el.summaryDate.textContent = formatFriendlyDate(state.selectedDate);
  }
  if (state.selectedSlot) {
    el.summaryTime.textContent = `${state.selectedSlot.formattedTime} - ${state.selectedSlot.formattedEndTime}`;
  }
}

// =========================================================
// 5. STEP 4: SUBMIT BOOKING & GOOGLE CALENDAR SYNC
// =========================================================

async function submitBooking() {
  // Validate inputs
  const name = el.inputName.value.trim();
  const phone = el.inputPhone.value.trim();
  const email = el.inputEmail.value.trim();
  const notes = el.inputNotes.value.trim();

  if (!name || name.length < 2) {
    showToast('Please enter your full name.', 'error');
    el.inputName.focus();
    return;
  }

  if (!phone || phone.length < 7) {
    showToast('Please enter a valid contact phone number.', 'error');
    el.inputPhone.focus();
    return;
  }

  if (!state.selectedService || !state.selectedDate || !state.selectedSlot) {
    showToast('Please select a service, date, and time slot.', 'error');
    return;
  }

  // Loading state
  el.confirmBookingBtn.disabled = true;
  el.confirmBookingBtn.innerHTML = `
    <span style="display:inline-block; animation: spin 1s linear infinite;">⏳</span>
    <span>Confirming & Syncing with Google Calendar...</span>
  `;

  try {
    const payload = {
      serviceId: state.selectedService.id,
      date: state.selectedDate,
      startTime: state.selectedSlot.time,
      customerName: name,
      phone: phone,
      email: email,
      notes: notes
    };

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.status === 201 && data.success) {
      state.confirmedBooking = data.booking;
      showConfirmedScreen(data.booking);
      showToast('Appointment successfully confirmed and synced!', 'success');
    } else {
      // Conflict or validation error
      showToast(data.error || 'Failed to book appointment. Please try again.', 'error');
      // If conflict, refresh slots
      if (res.status === 409) {
        goToStep(2);
        fetchAvailableSlots();
      }
    }
  } catch (err) {
    showToast('Network error occurred. Please try again.', 'error');
  } finally {
    el.confirmBookingBtn.disabled = false;
    el.confirmBookingBtn.innerHTML = `<span>Confirm Appointment</span>`;
  }
}

function showConfirmedScreen(booking) {
  el.confirmRef.textContent = booking.bookingRef;
  el.confirmName.textContent = booking.customerName;
  el.confirmService.textContent = booking.serviceName;
  el.confirmDateTime.textContent = `${formatFriendlyDate(booking.date)} at ${format12Hour(booking.startTime)}`;
  el.confirmDuration.textContent = `${booking.duration} Minutes`;
  el.confirmPrice.textContent = `₹${booking.price}`;

  // Set Google Calendar direct link
  if (booking.addToGoogleCalendarUrl) {
    el.confirmGcalBtn.href = booking.addToGoogleCalendarUrl;
    el.confirmGcalBtn.target = '_blank';
  }

  // Set WhatsApp button
  if (booking.whatsappUrl) {
    el.confirmWhatsAppBtn.href = booking.whatsappUrl;
    el.confirmWhatsAppBtn.target = '_blank';
    
    // Automatically open WhatsApp in new tab with the booking message
    try {
      window.open(booking.whatsappUrl, '_blank');
    } catch (e) {
      console.warn('Auto open WhatsApp notice:', e);
    }
  }

  // Set ICS Download Button
  el.confirmIcsBtn.onclick = () => downloadIcsFile(booking);

  goToStep(4);
}

// Download .ics calendar file for Apple Calendar / Outlook / Thunderbird
function downloadIcsFile(booking) {
  const cleanDate = booking.date.replace(/-/g, '');
  const cleanStart = booking.startTime.replace(':', '');
  const cleanEnd = booking.endTime.replace(':', '');
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mosphere Luxury Salon//Appointment Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.id}@mosphere.com`,
    `DTSTAMP:${cleanDate}T${cleanStart}00Z`,
    `DTSTART:${cleanDate}T${cleanStart}00`,
    `DTEND:${cleanDate}T${cleanEnd}00`,
    `SUMMARY:Mosphere Appointment - ${booking.serviceName}`,
    `DESCRIPTION:Appointment for ${booking.customerName} (${booking.serviceName}). Ref: ${booking.bookingRef}`,
    `LOCATION:Mosphere Luxury Salon, The Palladium Gallery`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `Mosphere_Appointment_${booking.bookingRef}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// =========================================================
// 6. WIZARD STEP NAVIGATION
// =========================================================

function goToStep(stepNumber) {
  state.currentStep = stepNumber;
  
  el.wizardSteps.forEach(step => {
    const sNum = parseInt(step.dataset.step, 10);
    step.classList.remove('active', 'completed');
    if (sNum === stepNumber) {
      step.classList.add('active');
    } else if (sNum < stepNumber) {
      step.classList.add('completed');
    }
  });

  el.stepPanels.forEach(panel => {
    panel.classList.remove('active');
    if (parseInt(panel.dataset.step, 10) === stepNumber) {
      panel.classList.add('active');
    }
  });

  // Scroll smoothly to wizard top
  const bookingCard = document.querySelector('.booking-card');
  if (bookingCard && stepNumber !== 1) {
    bookingCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  updateNavigationState();
}

function updateNavigationState() {
  if (el.toStep2Btn) {
    el.toStep2Btn.disabled = !state.selectedService;
  }
  if (el.toStep3Btn) {
    el.toStep3Btn.disabled = !state.selectedDate || !state.selectedSlot;
  }
}

function updateMobileCta() {
  if (!el.mobileCta) return;
  if (state.selectedService) {
    el.mobileCtaService.textContent = state.selectedService.name;
    el.mobileCtaPrice.textContent = `₹${state.selectedService.price} • ${state.selectedService.duration}m`;
  }
}

// =========================================================
// 7. EVENT LISTENERS
// =========================================================

function setupEventListeners() {
  // Wizard Steps Clicking (Allow jumping backwards)
  el.wizardSteps.forEach(step => {
    step.addEventListener('click', () => {
      const targetStep = parseInt(step.dataset.step, 10);
      if (targetStep < state.currentStep) {
        goToStep(targetStep);
      } else if (targetStep === 2 && state.selectedService) {
        goToStep(2);
      } else if (targetStep === 3 && state.selectedService && state.selectedSlot) {
        goToStep(3);
      }
    });
  });

  // Next / Back Buttons
  if (el.toStep2Btn) el.toStep2Btn.addEventListener('click', () => goToStep(2));
  if (el.backToStep1Btn) el.backToStep1Btn.addEventListener('click', () => goToStep(1));
  
  if (el.toStep3Btn) {
    el.toStep3Btn.addEventListener('click', () => {
      updateSummary();
      goToStep(3);
    });
  }
  if (el.backToStep2Btn) el.backToStep2Btn.addEventListener('click', () => goToStep(2));

  // Calendar Month Navigation
  if (el.prevMonthBtn) {
    el.prevMonthBtn.addEventListener('click', () => {
      state.currentMonth--;
      if (state.currentMonth < 0) {
        state.currentMonth = 11;
        state.currentYear--;
      }
      renderCalendar();
    });
  }

  if (el.nextMonthBtn) {
    el.nextMonthBtn.addEventListener('click', () => {
      state.currentMonth++;
      if (state.currentMonth > 11) {
        state.currentMonth = 0;
        state.currentYear++;
      }
      renderCalendar();
    });
  }

  // Booking Confirmation Submit
  if (el.confirmBookingBtn) {
    el.confirmBookingBtn.addEventListener('click', submitBooking);
  }

  // Book Another
  if (el.bookAnotherBtn) {
    el.bookAnotherBtn.addEventListener('click', () => {
      state.selectedService = null;
      state.selectedSlot = null;
      state.confirmedBooking = null;
      el.inputName.value = '';
      el.inputPhone.value = '';
      el.inputEmail.value = '';
      el.inputNotes.value = '';
      renderServices();
      goToStep(1);
    });
  }

  // Mobile CTA button
  if (el.mobileCtaBtn) {
    el.mobileCtaBtn.addEventListener('click', () => {
      if (state.currentStep === 1 && state.selectedService) {
        goToStep(2);
      } else if (state.currentStep === 2 && state.selectedSlot) {
        updateSummary();
        goToStep(3);
      } else if (state.currentStep === 3) {
        submitBooking();
      } else {
        const wizard = document.getElementById('bookingWizard');
        if (wizard) wizard.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

// Start
document.addEventListener('DOMContentLoaded', initApp);
