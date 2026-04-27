(() => {
  'use strict';

  const API_BASE_URL = '/api';
  const GUEST_RESERVATION_KEY = 'buffetease-guest-reservation-id';
  const HK_PHONE_PREFIX = '852-';
  const ALERT_THROTTLE_MS = 1000;

  const state = {
    packages: [],
    currentPackage: null,
    selectedSession: null,
    lastAlertAt: 0,
  };

  const createGuestReservationId = () =>
    `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const getOrCreateGuestReservationId = () => {
    const existing = sessionStorage.getItem(GUEST_RESERVATION_KEY);
    if (existing) return existing;
    const generated = createGuestReservationId();
    sessionStorage.setItem(GUEST_RESERVATION_KEY, generated);
    return generated;
  };

  const requestJson = async (url, options = {}) => {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed (${response.status})`);
    }

    if (response.status === 204) return null;
    return response.json();
  };

  const formatDate = (dateStr) =>
    new Intl.DateTimeFormat('en-HK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateStr));

  const formatMoney = (amount) => `$${Number(amount || 0).toFixed(0)}`;

  const showThrottledAlert = (message) => {
    const now = Date.now();
    if (now - state.lastAlertAt < ALERT_THROTTLE_MS) return;
    state.lastAlertAt = now;
    alert(message);
  };

  const normalizePhoneValue = (rawValue) => {
    const digits = String(rawValue || '')
      .replace(HK_PHONE_PREFIX, '')
      .replace(/\D/g, '')
      .slice(0, 8);
    return `${HK_PHONE_PREFIX}${digits}`;
  };

  const renderPackages = () => {
    const container = document.getElementById('packages-grid');
    if (!container) return;

    if (!state.packages.length) {
      container.innerHTML = '<p class="text-gray-500 col-span-full text-center py-12">No active packages available right now.</p>';
      return;
    }

    container.innerHTML = state.packages
      .map(
        (pkg) => `
          <div class="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
            <div class="relative h-64">
              <img src="${pkg.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(pkg.name)}/800/600`}" class="w-full h-full object-cover" alt="${pkg.name}">
              <div class="absolute top-4 right-4 bg-white px-4 py-1 rounded-full text-xs font-bold uppercase">${pkg.type}</div>
            </div>
            <div class="p-8 flex-1 flex flex-col">
              <h3 class="serif text-2xl mb-2">${pkg.name}</h3>
              <p class="text-gray-600 mb-6 min-h-[56px]">${pkg.description || ''}</p>
              <div class="flex justify-between items-end mb-6">
                <div>
                  <span class="text-4xl font-bold text-brand-olive">${formatMoney(pkg.pricePerPerson)}</span>
                  <span class="text-gray-500"> / person</span>
                </div>
              </div>
              <button onclick="openBookingModal('${pkg.id}')" class="w-full mt-auto bg-green text-white py-4 rounded-full font-semibold tracking-wide">
                Book This Package
              </button>
            </div>
          </div>
        `,
      )
      .join('');
  };

  const renderSessions = async () => {
    const container = document.getElementById('session-list');
    if (!container || !state.currentPackage) return;

    container.innerHTML = '<p class="text-gray-500">Loading sessions...</p>';
    state.selectedSession = null;

    try {
      const sessions = await requestJson(`${API_BASE_URL}/sessions/package/${state.currentPackage.id}`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const openSessions = (sessions || [])
        .filter((s) => s.status === 'OPEN' && new Date(s.sessionDate) >= today)
        .sort((a, b) => {
          const dateDiff = new Date(a.sessionDate) - new Date(b.sessionDate);
          if (dateDiff !== 0) return dateDiff;
          return String(a.startTime).localeCompare(String(b.startTime));
        });

      if (!openSessions.length) {
        container.innerHTML = '<p class="text-gray-500">No available sessions for this package.</p>';
        return;
      }

      container.innerHTML = openSessions
        .map((session) => {
          const seatsLeft = Math.max(0, Number(session.maxCapacity) - Number(session.currentBooked));
          return `
            <button onclick="selectSession('${session.id}')" data-session-id="${session.id}" class="session-btn p-6 border-2 border-transparent hover:border-brand-olive rounded-2xl text-left bg-white">
              <div class="font-semibold">${formatDate(session.sessionDate)}</div>
              <div class="text-xl font-bold mt-1">${session.startTime} - ${session.endTime}</div>
              <div class="text-green-600 mt-3">${seatsLeft} seats left</div>
            </button>
          `;
        })
        .join('');

      window.__buffetSessions = openSessions;
    } catch (error) {
      container.innerHTML = '<p class="text-red-600">Failed to load sessions. Please try again.</p>';
      console.error(error);
    }
  };

  const selectSessionById = (sessionId) => {
    const sessions = window.__buffetSessions || [];
    state.selectedSession = sessions.find((s) => String(s.id) === String(sessionId)) || null;

    document.querySelectorAll('.session-btn').forEach((btn) => {
      btn.classList.remove('border-brand-olive', 'bg-green-50');
      if (btn.getAttribute('data-session-id') === String(sessionId)) {
        btn.classList.add('border-brand-olive', 'bg-green-50');
      }
    });

    const form = document.getElementById('booking-form');
    if (form) form.classList.remove('hidden');
    updateTotal();
  };

  const updateTotal = () => {
    const totalEl = document.getElementById('total-price');
    const guestEl = document.getElementById('guest-count');
    if (!totalEl || !guestEl || !state.currentPackage) return;

    const guests = Number.parseInt(guestEl.value, 10) || 1;
    totalEl.textContent = formatMoney(state.currentPackage.pricePerPerson * guests);
  };

  const validateBookingForm = () => {
    const name = (document.getElementById('name')?.value || '').trim();
    const email = (document.getElementById('email')?.value || '').trim();
    const phone = (document.getElementById('phone')?.value || '').trim();
    const guestCount = Number.parseInt(document.getElementById('guest-count')?.value || '0', 10);

    if (!name || !email || !phone) {
      showThrottledAlert('Please fill in all guest information fields: Name, Email, and Phone Number.');
      return null;
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      showThrottledAlert('Name can only contain English letters (A-Z) and spaces. Example: Chan Tai Man');
      return null;
    }
    if (!/^[^\s@]+@[^\s@]+\.com$/i.test(email)) {
      showThrottledAlert('Email must include "@" and end with ".com". Example: you@example.com');
      return null;
    }
    if (!/^852-\d{8}$/.test(phone)) {
      showThrottledAlert('Phone number format must be 852- followed by exactly 8 digits. Example: 852-12345678');
      return null;
    }

    const seatsLeft = state.selectedSession
      ? Number(state.selectedSession.maxCapacity) - Number(state.selectedSession.currentBooked)
      : 0;
    if (guestCount < 1 || guestCount > seatsLeft) {
      showThrottledAlert(`Guest count must be between 1 and ${Math.max(1, seatsLeft)}.`);
      return null;
    }

    return { name, email, phone, guestCount };
  };

  const loadPackages = async () => {
    const container = document.getElementById('packages-grid');
    if (container) container.innerHTML = '<p class="text-gray-500 col-span-full text-center py-12">Loading packages...</p>';

    try {
      state.packages = await requestJson(`${API_BASE_URL}/packages/active`);
      renderPackages();
    } catch (error) {
      if (container) {
        container.innerHTML = '<p class="text-red-600 col-span-full text-center py-12">Failed to load packages. Please try again later.</p>';
      }
      console.error(error);
    }
  };

  window.openBookingModal = (id) => {
    state.currentPackage = state.packages.find((p) => String(p.id) === String(id)) || null;
    if (!state.currentPackage) return;

    const title = document.getElementById('modal-package-name');
    if (title) title.textContent = state.currentPackage.name;

    document.getElementById('booking-modal')?.classList.remove('hidden');
    document.getElementById('booking-form')?.classList.add('hidden');
    updateTotal();
    renderSessions();
  };

  window.closeModal = () => {
    document.getElementById('booking-modal')?.classList.add('hidden');
    state.selectedSession = null;
  };

  window.selectSession = (sessionIdOrBtn) => {
    if (typeof sessionIdOrBtn === 'string') {
      selectSessionById(sessionIdOrBtn);
      return;
    }

    const button = sessionIdOrBtn?.closest?.('[data-session-id]');
    const sessionId = button?.getAttribute?.('data-session-id');
    if (sessionId) selectSessionById(sessionId);
  };

  window.updateTotal = updateTotal;

  window.confirmBooking = async () => {
    if (!state.currentPackage || !state.selectedSession) {
      alert('Please select a session first.');
      return;
    }

    const validated = validateBookingForm();
    if (!validated) return;

    const specialRequest = (document.getElementById('special-request')?.value || '').trim();
    const detailLines = [
      `Contact Name: ${validated.name}`,
      `Contact Email: ${validated.email}`,
      `Contact Phone: ${validated.phone}`,
      specialRequest ? `Notes: ${specialRequest}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    const payload = {
      userId: getOrCreateGuestReservationId(),
      sessionId: state.selectedSession.id,
      guestCount: validated.guestCount,
      specialRequest: detailLines,
      status: 'SUCCESSFUL',
      updatedAt: new Date().toISOString(),
    };

    try {
      await requestJson(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      alert('Reservation successful. You can view it in My Bookings.');
      window.closeModal();
      window.location.href = 'my-bookings.html';
    } catch (error) {
      console.error(error);
      alert('Failed to create reservation. Please try again.');
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    loadPackages();

    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
      phoneInput.value = normalizePhoneValue(phoneInput.value);

      phoneInput.addEventListener('keydown', (event) => {
        const selectionStart = phoneInput.selectionStart ?? 0;
        const protectedZone = selectionStart <= HK_PHONE_PREFIX.length;
        const isBackspaceOrDelete = event.key === 'Backspace' || event.key === 'Delete';

        if (isBackspaceOrDelete && protectedZone) {
          event.preventDefault();
          showThrottledAlert('The prefix "852-" is fixed and cannot be deleted. Please enter only 8 digits after it.');
        }
      });

      phoneInput.addEventListener('input', () => {
        const originalValue = phoneInput.value;
        const normalized = normalizePhoneValue(originalValue);
        phoneInput.value = normalized;

        if (originalValue !== normalized) {
          showThrottledAlert('Phone number allows digits only after "852-", up to 8 digits.');
        }
      });

      phoneInput.addEventListener('focus', () => {
        if (!phoneInput.value.startsWith(HK_PHONE_PREFIX)) {
          phoneInput.value = HK_PHONE_PREFIX;
        }
        setTimeout(() => {
          const pos = phoneInput.value.length;
          phoneInput.setSelectionRange(pos, pos);
        }, 0);
      });
    }
  });
})();
