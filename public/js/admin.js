/**
 * MOSPHERE ADMIN PORTAL JAVASCRIPT
 */

const adminState = {
  token: localStorage.getItem('mosphere_admin_token') || null,
  currentUser: null,
  activeTab: 'dashboard',
  
  appointments: [],
  services: [],
  settings: {},
  stats: {},
  
  // Filters
  filterDate: '',
  filterStatus: 'all',
  filterSearch: '',
  
  // Visual Calendar State
  currentCalMonth: new Date().getMonth(),
  currentCalYear: new Date().getFullYear(),
  selectedCalDate: new Date().toISOString().split('T')[0],
  viewMode: 'calendar',
  
  // Selected appointment for modals
  currentAppointment: null,
  rescheduleSlots: []
};

// DOM References
const aEl = {
  loginModal: document.getElementById('loginModal'),
  loginForm: document.getElementById('loginForm'),
  loginUser: document.getElementById('loginUser'),
  loginPass: document.getElementById('loginPass'),
  loginError: document.getElementById('loginError'),
  
  adminLayout: document.getElementById('adminLayout'),
  adminUserDisplay: document.getElementById('adminUserDisplay'),
  logoutBtn: document.getElementById('logoutBtn'),
  gcalTopBadge: document.getElementById('gcalTopBadge'),
  
  // Nav tabs
  menuTabs: document.querySelectorAll('.menu-item'),
  tabPanels: document.querySelectorAll('.admin-tab-panel'),
  
  // Modals
  rescheduleModal: document.getElementById('rescheduleModal'),
  serviceModal: document.getElementById('serviceModal'),
  newBookingModal: document.getElementById('newBookingModal'),
  appointmentDetailModal: document.getElementById('appointmentDetailModal'),
  
  toastContainer: document.getElementById('adminToastContainer')
};

// Toast
function adminToast(msg, type = 'info') {
  if (!aEl.toastContainer) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${msg}</span>`;
  aEl.toastContainer.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 300);
  }, 4000);
}

// API Helper with Auth Header
async function adminFetch(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (adminState.token) {
    headers['Authorization'] = `Bearer ${adminState.token}`;
  }

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    // Session expired or invalid
    localStorage.removeItem('mosphere_admin_token');
    adminState.token = null;
    showLoginModal();
    throw new Error('Unauthorized');
  }

  return res.json();
}

// Init
async function initAdmin() {
  setupEventListeners();

  if (!adminState.token) {
    showLoginModal();
  } else {
    try {
      const meRes = await adminFetch('/api/admin/me');
      if (meRes.success) {
        adminState.currentUser = meRes.user;
        hideLoginModal();
        loadAllData();
      } else {
        showLoginModal();
      }
    } catch {
      showLoginModal();
    }
  }
}

function showLoginModal() {
  if (aEl.loginModal) aEl.loginModal.style.display = 'flex';
  if (aEl.adminLayout) aEl.adminLayout.style.display = 'none';
}

function hideLoginModal() {
  if (aEl.loginModal) aEl.loginModal.style.display = 'none';
  if (aEl.adminLayout) aEl.adminLayout.style.display = 'flex';
  if (aEl.adminUserDisplay && adminState.currentUser) {
    aEl.adminUserDisplay.textContent = adminState.currentUser.name || adminState.currentUser.username;
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const username = aEl.loginUser.value.trim();
  const password = aEl.loginPass.value.trim();
  aEl.loginError.style.display = 'none';

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      adminState.token = data.token;
      adminState.currentUser = data.user;
      localStorage.setItem('mosphere_admin_token', data.token);
      hideLoginModal();
      loadAllData();
      adminToast('Welcome back to Mosphere Concierge', 'success');
    } else {
      aEl.loginError.textContent = data.error || 'Invalid credentials.';
      aEl.loginError.style.display = 'block';
    }
  } catch (err) {
    aEl.loginError.textContent = 'Server connection error.';
    aEl.loginError.style.display = 'block';
  }
}

function handleLogout() {
  localStorage.removeItem('mosphere_admin_token');
  adminState.token = null;
  adminState.currentUser = null;
  showLoginModal();
}

async function loadAllData() {
  await Promise.all([
    checkGoogleCalendarStatus(),
    loadStats(),
    loadAppointments(),
    loadServices(),
    loadSettings()
  ]);
}

// 1. Google Calendar Diagnostics
async function checkGoogleCalendarStatus() {
  try {
    const data = await adminFetch('/api/admin/calendar/status');
    const badge = aEl.gcalTopBadge;
    const diagBox = document.getElementById('gcalDiagResults');

    if (data.success && data.diagnostic) {
      const d = data.diagnostic;
      if (d.status === 'connected') {
        badge.className = 'gcal-status-badge connected';
        badge.innerHTML = `<span>●</span> <span>Google Calendar: Connected (${d.calendarId})</span>`;
      } else {
        badge.className = 'gcal-status-badge warning';
        badge.innerHTML = `<span>⚡</span> <span>Google Calendar: Dev Simulator Mode</span>`;
      }

      if (diagBox) {
        diagBox.innerHTML = `
          <div style="background: rgba(0,0,0,0.4); border: 1px solid var(--border-dark); border-radius: var(--radius-sm); padding: 18px;">
            <div style="display:flex; justify-content:space-between; margin-bottom: 10px;">
              <strong>Status:</strong>
              <span style="color: ${d.status === 'connected' ? '#10b981' : '#f59e0b'}; font-weight: 600;">${d.status.toUpperCase()}</span>
            </div>
            <div style="margin-bottom: 8px;"><strong>Calendar ID:</strong> ${d.calendarId || 'None'}</div>
            <div style="margin-bottom: 8px;"><strong>Service Account:</strong> ${d.serviceAccountEmail || 'None'}</div>
            <div style="margin-bottom: 8px;"><strong>Timezone:</strong> ${d.timeZone || 'Asia/Kolkata'}</div>
            <div style="color: var(--text-muted); font-size: 12px; margin-top: 10px;">${d.message}</div>
          </div>
        `;
      }
    }
  } catch (err) {
    console.error('Error checking Google Calendar status:', err);
  }
}

// 2. Stats
async function loadStats() {
  try {
    const data = await adminFetch('/api/admin/stats');
    if (data.success && data.stats) {
      const s = data.stats;
      document.getElementById('statTodayBookings').textContent = s.todayCount;
      document.getElementById('statTodayRevenue').textContent = `₹${s.todayRevenue || 0}`;
      document.getElementById('statUpcomingBookings').textContent = s.upcomingCount;
      document.getElementById('statTotalCompleted').textContent = s.completedCount;
      document.getElementById('statTotalRevenue').textContent = `₹${s.totalRevenue || 0}`;
    }
  } catch (err) {
    console.error(err);
  }
}

// 3. Appointments & Schedule
async function loadAppointments() {
  const tbody = document.getElementById('appointmentsTbody');
  const todayTbody = document.getElementById('todayScheduleTbody');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Loading appointments...</td></tr>`;
  }

  try {
    const params = new URLSearchParams();
    if (adminState.filterDate) params.append('date', adminState.filterDate);
    if (adminState.filterStatus && adminState.filterStatus !== 'all') params.append('status', adminState.filterStatus);
    if (adminState.filterSearch) params.append('search', adminState.filterSearch);

    const data = await adminFetch(`/api/admin/appointments?${params.toString()}`);
    if (data.success) {
      adminState.appointments = data.bookings;
      
      // Render Table
      if (tbody) {
        renderAppointmentsTable(data.bookings, tbody);
      }

      // Render Visual Calendar
      renderCalendar();

      // Render today's schedule on dashboard overview
      if (todayTbody) {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayItems = data.bookings.filter(b => b.date === todayStr);
        renderAppointmentsTable(todayItems, todayTbody, true);
      }
    }
  } catch (err) {
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="7" style="color:var(--accent-danger); text-align:center;">Failed to load appointments.</td></tr>`;
    }
  }
}

// ---------------------------------------------------------------------------
// VISUAL CALENDAR ENGINE
// ---------------------------------------------------------------------------

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

window.switchAppointmentsView = function(mode) {
  adminState.viewMode = mode;
  const calView = document.getElementById('appointmentsCalendarView');
  const tblView = document.getElementById('appointmentsTableView');
  const btnCal = document.getElementById('btnViewCalendar');
  const btnTbl = document.getElementById('btnViewTable');

  if (mode === 'calendar') {
    if (calView) calView.style.display = 'block';
    if (tblView) tblView.style.display = 'none';
    if (btnCal) btnCal.classList.add('active');
    if (btnTbl) btnTbl.classList.remove('active');
    renderCalendar();
  } else {
    if (calView) calView.style.display = 'none';
    if (tblView) tblView.style.display = 'block';
    if (btnCal) btnCal.classList.remove('active');
    if (btnTbl) btnTbl.classList.add('active');
  }
};

window.navCalendarMonth = function(delta) {
  adminState.currentCalMonth += delta;
  if (adminState.currentCalMonth < 0) {
    adminState.currentCalMonth = 11;
    adminState.currentCalYear -= 1;
  } else if (adminState.currentCalMonth > 11) {
    adminState.currentCalMonth = 0;
    adminState.currentCalYear += 1;
  }
  renderCalendar();
};

window.navCalendarToday = function() {
  const now = new Date();
  adminState.currentCalMonth = now.getMonth();
  adminState.currentCalYear = now.getFullYear();
  adminState.selectedCalDate = now.toISOString().split('T')[0];
  renderCalendar();
};

window.selectCalendarDate = function(dateStr) {
  adminState.selectedCalDate = dateStr;
  
  // Highlight cell
  document.querySelectorAll('.cal-day-cell').forEach(c => {
    if (c.getAttribute('data-date') === dateStr) {
      c.classList.add('is-selected');
    } else {
      c.classList.remove('is-selected');
    }
  });

  renderDaySchedule(dateStr);
};

function renderCalendar() {
  const grid = document.getElementById('calendarMonthGrid');
  const titleEl = document.getElementById('calMonthYearTitle');
  if (!grid || !titleEl) return;

  const month = adminState.currentCalMonth;
  const year = adminState.currentCalYear;
  titleEl.textContent = `${monthNames[month]} ${year}`;

  const todayStr = new Date().toISOString().split('T')[0];
  if (!adminState.selectedCalDate) {
    adminState.selectedCalDate = todayStr;
  }

  // Group appointments by date
  const apptMap = new Map();
  for (const b of adminState.appointments) {
    if (!apptMap.has(b.date)) apptMap.set(b.date, []);
    apptMap.get(b.date).push(b);
  }

  // First day of current month & total days
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  let html = '';

  // 1. Prev month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevDay = prevMonthTotalDays - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;
    const dayAppts = apptMap.get(dateStr) || [];
    
    html += renderDayCellHtml(prevDay, dateStr, dayAppts, true, todayStr);
  }

  // 2. Current month days
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayAppts = apptMap.get(dateStr) || [];
    
    html += renderDayCellHtml(day, dateStr, dayAppts, false, todayStr);
  }

  // 3. Next month leading days to complete 35 or 42 grid cells
  const totalCellsSoFar = firstDayIndex + totalDaysInMonth;
  const targetTotalCells = totalCellsSoFar <= 35 ? 35 : 42;
  const nextMonthDays = targetTotalCells - totalCellsSoFar;

  for (let day = 1; day <= nextMonthDays; day++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayAppts = apptMap.get(dateStr) || [];

    html += renderDayCellHtml(day, dateStr, dayAppts, true, todayStr);
  }

  grid.innerHTML = html;

  // Render Day Schedule for selected date
  renderDaySchedule(adminState.selectedCalDate);
}

function renderDayCellHtml(dayNum, dateStr, appts, isOtherMonth, todayStr) {
  const isToday = dateStr === todayStr;
  const isSelected = dateStr === adminState.selectedCalDate;
  const count = appts.length;

  let classes = ['cal-day-cell'];
  if (isOtherMonth) classes.push('is-other-month');
  if (isToday) classes.push('is-today');
  if (isSelected) classes.push('is-selected');

  // Chips preview (max 3)
  let chipsHtml = '';
  const maxVisibleChips = 3;
  const visibleAppts = appts.slice(0, maxVisibleChips);

  visibleAppts.forEach(a => {
    const statusClass = (a.status || 'confirmed').toLowerCase();
    chipsHtml += `
      <div class="cal-booking-chip ${statusClass}" onclick="event.stopPropagation(); openAppointmentDetailModal('${a.id}')" title="${a.customerName} - ${a.serviceName} (${a.startTime})">
        <span class="cal-chip-time">${a.startTime}</span>
        <span>${a.customerName.split(' ')[0]} • ${a.serviceName}</span>
      </div>
    `;
  });

  if (appts.length > maxVisibleChips) {
    chipsHtml += `<div class="cal-chip-more">+${appts.length - maxVisibleChips} more</div>`;
  }

  return `
    <div class="${classes.join(' ')}" data-date="${dateStr}" onclick="selectCalendarDate('${dateStr}')">
      <div class="cal-day-top">
        <span class="cal-day-num">${dayNum}</span>
        ${count > 0 ? `<span class="cal-count-badge">${count}</span>` : ''}
      </div>
      <div class="cal-chips-container">
        ${chipsHtml}
      </div>
    </div>
  `;
}

function renderDaySchedule(dateStr) {
  const listEl = document.getElementById('dayScheduleItems');
  const labelEl = document.getElementById('selectedDayLabel');
  const subEl = document.getElementById('selectedDaySub');
  if (!listEl) return;

  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const formattedDay = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const dayAppts = adminState.appointments.filter(a => a.date === dateStr);
  dayAppts.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  if (labelEl) labelEl.textContent = formattedDay;
  if (subEl) subEl.textContent = `${dayAppts.length} Reservation${dayAppts.length === 1 ? '' : 's'} scheduled`;

  if (dayAppts.length === 0) {
    listEl.innerHTML = `
      <div style="text-align:center; padding: 32px 16px; color: var(--text-muted); background: rgba(0,0,0,0.2); border-radius: var(--radius-sm); border: 1px dashed var(--border-dark);">
        <div style="font-size: 13px; font-weight: 500; color: #fff; margin-bottom: 4px;">No Bookings Scheduled</div>
        <p style="font-size: 11px; margin-bottom: 14px;">This date has full availability on the calendar.</p>
        <button type="button" onclick="openManualBookingForDate('${dateStr}')" class="btn btn-primary btn-sm" style="font-size: 11px;">
          <span>+ Book Walk-in on ${dateStr}</span>
        </button>
      </div>
    `;
    return;
  }

  listEl.innerHTML = dayAppts.map(b => {
    const statusClass = (b.status || 'confirmed').toLowerCase();
    const phoneClean = (b.phone || '').replace(/[^0-9]/g, '');
    const waText = encodeURIComponent(`Hello ${b.customerName}, this is Mosphere Concierge regarding your appointment for ${b.serviceName} on ${b.date} at ${b.startTime}.`);

    return `
      <div class="day-schedule-card ${statusClass}" onclick="openAppointmentDetailModal('${b.id}')" style="cursor: pointer;">
        <div class="day-card-time">
          <span>${b.startTime} - ${b.endTime}</span>
          <span class="status-pill ${statusClass}" style="font-size: 10px; padding: 2px 8px;">${b.status}</span>
        </div>
        <div class="day-card-customer">${b.customerName}</div>
        <div class="day-card-service">${b.serviceName} • ${b.duration} mins (₹${b.price})</div>
        ${b.notes ? `<div style="font-size: 11px; color: var(--gold-light); margin-bottom: 6px; font-style: italic;">"${b.notes}"</div>` : ''}
        
        <div class="day-card-actions" onclick="event.stopPropagation()">
          ${b.status !== 'completed' && b.status !== 'cancelled' ? `
            <button class="btn-icon" title="Mark Done" onclick="handleMarkCompleted('${b.id}')">Done</button>
            <button class="btn-icon" title="Reschedule" onclick="openRescheduleModal('${b.id}')">Reschedule</button>
            <button class="btn-icon danger" title="Cancel" onclick="handleCancelAppointment('${b.id}')">Cancel</button>
          ` : ''}
          <a class="btn-icon" title="WhatsApp" href="https://wa.me/${phoneClean}?text=${waText}" target="_blank">WhatsApp</a>
          <a class="btn-icon" title="Call" href="tel:${b.phone}">Call</a>
          <button class="btn-icon" title="Quick Details" onclick="openAppointmentDetailModal('${b.id}')">View</button>
        </div>
      </div>
    `;
  }).join('');
}

window.openManualBookingForDate = function(dateStr) {
  const targetDate = dateStr || adminState.selectedCalDate || new Date().toISOString().split('T')[0];
  openManualBookingModal();
  const dateInput = document.getElementById('manualBookingDate');
  if (dateInput) {
    dateInput.value = targetDate;
    handleManualDateOrServiceChange();
  }
};

window.openAppointmentDetailModal = function(id) {
  const appt = adminState.appointments.find(a => a.id === id);
  if (!appt || !aEl.appointmentDetailModal) return;

  document.getElementById('detailCustomerName').textContent = appt.customerName;
  document.getElementById('detailBookingRef').textContent = appt.bookingRef;
  document.getElementById('detailStatusBadge').innerHTML = `<span class="status-pill ${appt.status.toLowerCase()}">${appt.status}</span>`;
  document.getElementById('detailPrice').textContent = `₹${appt.price}`;
  document.getElementById('detailDateTime').textContent = `${appt.date} • ${appt.startTime} - ${appt.endTime}`;
  document.getElementById('detailDuration').textContent = `Estimated duration: ${appt.duration} minutes`;
  document.getElementById('detailServiceName').textContent = appt.serviceName;
  document.getElementById('detailLocation').textContent = `Location: ${appt.location ? appt.location.toUpperCase() : 'COLOMBO'}`;
  document.getElementById('detailPhone').textContent = appt.phone;
  document.getElementById('detailNotes').textContent = appt.notes || 'No special notes provided.';

  const phoneClean = appt.phone.replace(/[^0-9]/g, '');
  const waText = encodeURIComponent(`Hello ${appt.customerName}, this is Mosphere Concierge regarding your appointment for ${appt.serviceName} on ${appt.date} at ${appt.startTime}.`);
  document.getElementById('detailWhatsAppBtn').href = `https://wa.me/${phoneClean}?text=${waText}`;
  document.getElementById('detailCallBtn').href = `tel:${appt.phone}`;

  // Action Buttons
  const actionsContainer = document.getElementById('detailActionButtons');
  if (actionsContainer) {
    let btns = `<button type="button" class="btn btn-secondary btn-modal-cancel">Close</button>`;
    if (appt.status !== 'completed' && appt.status !== 'cancelled') {
      btns += `
        <button type="button" class="btn btn-secondary" onclick="aEl.appointmentDetailModal.classList.remove('active'); openRescheduleModal('${appt.id}')">
          Reschedule
        </button>
        <button type="button" class="btn btn-primary" onclick="aEl.appointmentDetailModal.classList.remove('active'); handleMarkCompleted('${appt.id}')">
          Mark Completed
        </button>
        <button type="button" class="btn btn-outline-gold" style="color:var(--accent-danger); border-color:var(--accent-danger);" onclick="aEl.appointmentDetailModal.classList.remove('active'); handleCancelAppointment('${appt.id}')">
          Cancel
        </button>
      `;
    }
    actionsContainer.innerHTML = btns;
  }

  aEl.appointmentDetailModal.classList.add('active');
};

function renderAppointmentsTable(items, targetTbody, isCompact = false) {
  if (items.length === 0) {
    targetTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:30px;">No appointments found matching current filter.</td></tr>`;
    return;
  }

  targetTbody.innerHTML = items.map(b => {
    const statusClass = b.status.toLowerCase();
    const phoneClean = b.phone.replace(/[^0-9]/g, '');
    const waText = encodeURIComponent(`Hello ${b.customerName}, this is Mosphere Concierge regarding your appointment for ${b.serviceName} on ${b.date} at ${b.startTime}.`);
    
    return `
      <tr>
        <td>
          <span style="font-family: monospace; font-weight: 600; color: var(--gold-light);">${b.bookingRef}</span>
          <div style="font-size: 11px; color: var(--text-muted);">${new Date(b.createdAt).toLocaleDateString()}</div>
        </td>
        <td>
          <div style="font-weight: 600; color: #fff;">${b.customerName}</div>
          <div style="font-size: 12px; color: var(--text-muted);">${b.phone}</div>
        </td>
        <td>
          <div style="font-weight: 500;">${b.serviceName}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${b.duration} mins • ₹${b.price}</div>
        </td>
        <td>
          <div style="font-weight: 600; color: #fff;">${b.date}</div>
          <div style="color: var(--gold-light); font-size: 12px;">${b.startTime} - ${b.endTime}</div>
        </td>
        <td>
          <span class="status-pill ${statusClass}">${b.status}</span>
        </td>
        <td>
          <div style="font-size: 11px; color: var(--text-muted); max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${b.notes || ''}">
            ${b.notes || '—'}
          </div>
        </td>
        <td>
          <div class="table-actions">
            ${b.status !== 'completed' && b.status !== 'cancelled' ? `
              <button class="btn-icon" title="Mark Completed" onclick="handleMarkCompleted('${b.id}')">Done</button>
              <button class="btn-icon" title="Reschedule" onclick="openRescheduleModal('${b.id}')">Reschedule</button>
              <button class="btn-icon danger" title="Cancel Appointment" onclick="handleCancelAppointment('${b.id}')">Cancel</button>
            ` : ''}
            <a class="btn-icon" title="WhatsApp Customer" href="https://wa.me/${phoneClean}?text=${waText}" target="_blank">WhatsApp</a>
            <a class="btn-icon" title="Call Customer" href="tel:${b.phone}">Call</a>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// 4. Appointment Actions (Reschedule, Cancel, Complete)
window.handleMarkCompleted = async function(id) {
  if (!confirm('Mark this appointment as completed?')) return;
  try {
    const res = await adminFetch(`/api/admin/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'completed' })
    });
    if (res.success) {
      adminToast('Appointment marked as completed.', 'success');
      loadAppointments();
      loadStats();
    }
  } catch (err) {
    adminToast('Failed to update status.', 'error');
  }
};

window.handleCancelAppointment = async function(id) {
  const reason = prompt('Reason for cancelling this appointment (will be removed from Google Calendar):', 'Customer requested cancellation');
  if (reason === null) return;

  try {
    const res = await adminFetch(`/api/admin/appointments/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason })
    });
    if (res.success) {
      adminToast('Appointment cancelled and synchronized with Google Calendar.', 'success');
      loadAppointments();
      loadStats();
    }
  } catch (err) {
    adminToast('Failed to cancel appointment.', 'error');
  }
};

window.openRescheduleModal = async function(id) {
  const appt = adminState.appointments.find(a => a.id === id);
  if (!appt) return;
  adminState.currentAppointment = appt;

  document.getElementById('rescheduleCustomerName').textContent = appt.customerName;
  document.getElementById('rescheduleService').textContent = appt.serviceName;
  document.getElementById('rescheduleCurrentTime').textContent = `${appt.date} at ${appt.startTime}`;
  
  const dateInput = document.getElementById('rescheduleDateInput');
  dateInput.value = appt.date;
  
  aEl.rescheduleModal.classList.add('active');
  await fetchRescheduleSlots(appt.date, appt.serviceId);
};

async function fetchRescheduleSlots(dateStr, serviceId) {
  const slotsDiv = document.getElementById('rescheduleSlotsGrid');
  slotsDiv.innerHTML = '<div style="color:var(--text-muted); font-size:13px;">Checking available Google Calendar slots...</div>';

  try {
    const data = await adminFetch(`/api/availability?date=${dateStr}&serviceId=${serviceId}`);
    if (data.success && data.slots.length > 0) {
      adminState.rescheduleSlots = data.slots;
      slotsDiv.innerHTML = data.slots.map(s => `
        <button type="button" class="time-slot-btn" onclick="selectRescheduleSlot('${s.time}', this)">
          ${s.formattedTime}
        </button>
      `).join('');
    } else {
      slotsDiv.innerHTML = `<div style="color:var(--accent-danger); font-size:13px;">No available slots on ${dateStr}.</div>`;
    }
  } catch (err) {
    slotsDiv.innerHTML = '<div style="color:var(--accent-danger);">Error fetching slots.</div>';
  }
}

let selectedRescheduleTime = null;
window.selectRescheduleSlot = function(time, btn) {
  selectedRescheduleTime = time;
  document.querySelectorAll('#rescheduleSlotsGrid .time-slot-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
};

async function submitReschedule() {
  if (!selectedRescheduleTime) {
    adminToast('Please select a new time slot.', 'error');
    return;
  }

  const newDate = document.getElementById('rescheduleDateInput').value;
  const apptId = adminState.currentAppointment.id;

  try {
    const res = await adminFetch(`/api/admin/appointments/${apptId}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({
        newDate,
        newStartTime: selectedRescheduleTime
      })
    });

    if (res.success) {
      adminToast('Appointment successfully rescheduled and synced with Google Calendar!', 'success');
      aEl.rescheduleModal.classList.remove('active');
      loadAppointments();
    } else {
      adminToast(res.error || 'Failed to reschedule.', 'error');
    }
  } catch (err) {
    adminToast('Error rescheduling appointment.', 'error');
  }
}

// 5. Services Management
async function loadServices() {
  const container = document.getElementById('adminServicesList');
  if (!container) return;

  try {
    const data = await adminFetch('/api/services/all');
    if (data.success) {
      adminState.services = data.services;
      container.innerHTML = data.services.map(s => `
        <div class="service-card" style="cursor: default;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <span class="service-category">${s.category}</span>
              <h4 style="font-size: 18px; color: #fff; margin: 4px 0;">${s.name}</h4>
              <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">${s.description || 'No description'}</p>
            </div>
            <span class="status-pill ${s.isActive ? 'confirmed' : 'cancelled'}">
              ${s.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-dark); padding-top:12px;">
            <div style="font-weight:600; color:var(--gold-light);">₹${s.price} • ${s.duration} mins</div>
            <div class="table-actions">
              <button class="btn-icon" title="Edit Service" onclick="openEditServiceModal('${s.id}')">✏️</button>
              <button class="btn-icon" title="Toggle Active" onclick="toggleServiceActive('${s.id}', ${s.isActive ? 0 : 1})">${s.isActive ? '⏸️' : '▶️'}</button>
              <button class="btn-icon danger" title="Delete Service" onclick="deleteService('${s.id}')">🗑️</button>
            </div>
          </div>
        </div>
      `).join('');

      // Populate service dropdown in manual booking modal
      const bookingSelect = document.getElementById('manualBookingService');
      if (bookingSelect) {
        bookingSelect.innerHTML = data.services.filter(s => s.isActive).map(s => `
          <option value="${s.id}">${s.name} (${s.duration}m - ₹${s.price})</option>
        `).join('');
      }
    }
  } catch (err) {
    console.error(err);
  }
}

window.openNewServiceModal = function() {
  document.getElementById('serviceModalTitle').textContent = 'Add New Service';
  document.getElementById('serviceFormId').value = '';
  document.getElementById('serviceFormName').value = '';
  document.getElementById('serviceFormDuration').value = '45';
  document.getElementById('serviceFormPrice').value = '1500';
  document.getElementById('serviceFormCategory').value = 'Hair Architecture';
  document.getElementById('serviceFormDesc').value = '';
  aEl.serviceModal.classList.add('active');
};

window.openEditServiceModal = function(id) {
  const s = adminState.services.find(item => item.id === id);
  if (!s) return;

  document.getElementById('serviceModalTitle').textContent = 'Edit Service';
  document.getElementById('serviceFormId').value = s.id;
  document.getElementById('serviceFormName').value = s.name;
  document.getElementById('serviceFormDuration').value = s.duration;
  document.getElementById('serviceFormPrice').value = s.price;
  document.getElementById('serviceFormCategory').value = s.category;
  document.getElementById('serviceFormDesc').value = s.description || '';
  aEl.serviceModal.classList.add('active');
};

async function handleSaveService(e) {
  e.preventDefault();
  const id = document.getElementById('serviceFormId').value;
  const name = document.getElementById('serviceFormName').value.trim();
  const duration = parseInt(document.getElementById('serviceFormDuration').value, 10);
  const price = parseFloat(document.getElementById('serviceFormPrice').value);
  const category = document.getElementById('serviceFormCategory').value.trim();
  const description = document.getElementById('serviceFormDesc').value.trim();

  const payload = { name, duration, price, category, description };
  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/services/${id}` : '/api/services';

  try {
    const res = await adminFetch(url, {
      method,
      body: JSON.stringify(payload)
    });

    if (res.success) {
      adminToast(`Service ${id ? 'updated' : 'created'} successfully.`, 'success');
      aEl.serviceModal.classList.remove('active');
      loadServices();
    } else {
      adminToast(res.error || 'Failed to save service.', 'error');
    }
  } catch (err) {
    adminToast('Error saving service.', 'error');
  }
}

window.toggleServiceActive = async function(id, newStatus) {
  try {
    const res = await adminFetch(`/api/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isActive: newStatus })
    });
    if (res.success) {
      adminToast(`Service ${newStatus ? 'activated' : 'deactivated'}.`, 'success');
      loadServices();
    }
  } catch (err) {
    adminToast('Error updating service status.', 'error');
  }
};

window.deleteService = async function(id) {
  if (!confirm('Are you sure you want to delete this service?')) return;
  try {
    const res = await adminFetch(`/api/services/${id}`, { method: 'DELETE' });
    if (res.success) {
      adminToast('Service deleted.', 'success');
      loadServices();
    }
  } catch (err) {
    adminToast('Error deleting service.', 'error');
  }
};

// 6. Settings & Business Hours
async function loadSettings() {
  try {
    const data = await adminFetch('/api/admin/settings');
    if (data.success && data.settings) {
      adminState.settings = data.settings;
      const s = data.settings;
      
      document.getElementById('settingOpenTime').value = s.openTime || '10:00';
      document.getElementById('settingCloseTime').value = s.closeTime || '20:00';
      document.getElementById('settingBufferMinutes').value = s.bufferMinutes || '15';
      document.getElementById('settingSlotInterval').value = s.slotInterval || '15';
      document.getElementById('settingSalonPhone').value = s.salonPhone || '';
      document.getElementById('settingSalonWhatsApp').value = s.salonWhatsApp || '';
      document.getElementById('settingSalonAddress').value = s.salonAddress || '';

      // Closed Days Checkboxes (0=Sun, 1=Mon, ..., 6=Sat)
      const closed = Array.isArray(s.closedDays) ? s.closedDays : [];
      for (let i = 0; i <= 6; i++) {
        const chk = document.getElementById(`closedDay_${i}`);
        if (chk) chk.checked = closed.includes(i);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function handleSaveSettings(e) {
  e.preventDefault();
  const openTime = document.getElementById('settingOpenTime').value;
  const closeTime = document.getElementById('settingCloseTime').value;
  const bufferMinutes = parseInt(document.getElementById('settingBufferMinutes').value, 10);
  const slotInterval = parseInt(document.getElementById('settingSlotInterval').value, 10);
  const salonPhone = document.getElementById('settingSalonPhone').value.trim();
  const salonWhatsApp = document.getElementById('settingSalonWhatsApp').value.trim();
  const salonAddress = document.getElementById('settingSalonAddress').value.trim();

  const closedDays = [];
  for (let i = 0; i <= 6; i++) {
    const chk = document.getElementById(`closedDay_${i}`);
    if (chk && chk.checked) closedDays.push(i);
  }

  try {
    const res = await adminFetch('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({
        openTime,
        closeTime,
        bufferMinutes,
        slotInterval,
        closedDays,
        salonPhone,
        salonWhatsApp,
        salonAddress
      })
    });

    if (res.success) {
      adminToast('Salon settings & business hours updated successfully.', 'success');
      loadSettings();
    }
  } catch (err) {
    adminToast('Failed to save settings.', 'error');
  }
}

// 7. Manual Walk-In Booking
window.openManualBookingModal = function() {
  const dateInput = document.getElementById('manualBookingDate');
  dateInput.value = new Date().toISOString().split('T')[0];
  aEl.newBookingModal.classList.add('active');
  fetchManualSlots();
};

async function fetchManualSlots() {
  const date = document.getElementById('manualBookingDate').value;
  const sId = document.getElementById('manualBookingService').value;
  const slotsDiv = document.getElementById('manualBookingSlots');
  slotsDiv.innerHTML = '<option value="">Checking slots...</option>';

  try {
    const data = await adminFetch(`/api/availability?date=${date}&serviceId=${sId}`);
    if (data.success && data.slots.length > 0) {
      slotsDiv.innerHTML = data.slots.map(s => `
        <option value="${s.time}">${s.formattedTime}</option>
      `).join('');
    } else {
      slotsDiv.innerHTML = '<option value="">No slots available</option>';
    }
  } catch {
    slotsDiv.innerHTML = '<option value="">Error loading slots</option>';
  }
}

async function handleManualBookingSubmit(e) {
  e.preventDefault();
  const serviceId = document.getElementById('manualBookingService').value;
  const date = document.getElementById('manualBookingDate').value;
  const startTime = document.getElementById('manualBookingSlots').value;
  const customerName = document.getElementById('manualCustomerName').value.trim();
  const phone = document.getElementById('manualCustomerPhone').value.trim();
  const notes = document.getElementById('manualCustomerNotes').value.trim();

  if (!startTime) {
    adminToast('Please choose an available time slot.', 'error');
    return;
  }

  try {
    const res = await adminFetch('/api/admin/appointments', {
      method: 'POST',
      body: JSON.stringify({
        serviceId,
        date,
        startTime,
        customerName,
        phone,
        notes
      })
    });

    if (res.success) {
      adminToast('Walk-in appointment booked and synced with Google Calendar!', 'success');
      aEl.newBookingModal.classList.remove('active');
      loadAppointments();
      loadStats();
    } else {
      adminToast(res.error || 'Failed to create booking.', 'error');
    }
  } catch (err) {
    adminToast('Error creating booking.', 'error');
  }
}

// 8. Event Listeners & Tab Switching
function setupEventListeners() {
  if (aEl.loginForm) aEl.loginForm.addEventListener('submit', handleLogin);
  if (aEl.logoutBtn) aEl.logoutBtn.addEventListener('click', handleLogout);

  // Tab switching
  aEl.menuTabs.forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.dataset.tab;
      adminState.activeTab = tab;

      aEl.menuTabs.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      aEl.tabPanels.forEach(panel => {
        panel.style.display = panel.id === `tab_${tab}` ? 'block' : 'none';
      });

      if (tab === 'appointments') loadAppointments();
      if (tab === 'services') loadServices();
      if (tab === 'settings') loadSettings();
      if (tab === 'calendar') checkGoogleCalendarStatus();
      if (tab === 'dashboard') loadStats();
    });
  });

  // Filter handlers
  const filterDate = document.getElementById('filterDate');
  const filterStatus = document.getElementById('filterStatus');
  const filterSearch = document.getElementById('filterSearch');

  if (filterDate) filterDate.addEventListener('change', (e) => {
    adminState.filterDate = e.target.value;
    loadAppointments();
  });

  if (filterStatus) filterStatus.addEventListener('change', (e) => {
    adminState.filterStatus = e.target.value;
    loadAppointments();
  });

  if (filterSearch) filterSearch.addEventListener('input', (e) => {
    adminState.filterSearch = e.target.value;
    loadAppointments();
  });

  // Reschedule date change listener
  const reschedDate = document.getElementById('rescheduleDateInput');
  if (reschedDate) {
    reschedDate.addEventListener('change', (e) => {
      if (adminState.currentAppointment) {
        fetchRescheduleSlots(e.target.value, adminState.currentAppointment.serviceId);
      }
    });
  }

  // Modal close buttons and overlay clicks
  document.querySelectorAll('.modal-close-btn, .btn-modal-cancel').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-modal-overlay').forEach(m => m.classList.remove('active'));
    });
  });

  document.querySelectorAll('.admin-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // Form submits
  const serviceForm = document.getElementById('serviceForm');
  if (serviceForm) serviceForm.addEventListener('submit', handleSaveService);

  const settingsForm = document.getElementById('settingsForm');
  if (settingsForm) settingsForm.addEventListener('submit', handleSaveSettings);

  const manualBookingForm = document.getElementById('manualBookingForm');
  if (manualBookingForm) manualBookingForm.addEventListener('submit', handleManualBookingSubmit);

  const rescheduleSubmitBtn = document.getElementById('submitRescheduleBtn');
  if (rescheduleSubmitBtn) rescheduleSubmitBtn.addEventListener('click', submitReschedule);

  const testGcalBtn = document.getElementById('testGcalBtn');
  if (testGcalBtn) testGcalBtn.addEventListener('click', () => {
    checkGoogleCalendarStatus();
    adminToast('Diagnostic test initiated against Google Calendar API.', 'info');
  });

  const manualDate = document.getElementById('manualBookingDate');
  const manualService = document.getElementById('manualBookingService');
  if (manualDate) manualDate.addEventListener('change', fetchManualSlots);
  if (manualService) manualService.addEventListener('change', fetchManualSlots);
}

document.addEventListener('DOMContentLoaded', initAdmin);
