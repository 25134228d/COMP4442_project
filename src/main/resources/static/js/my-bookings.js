(() => {
  'use strict';

  const API_BASE_URL = '/api';
  const GUEST_RESERVATION_KEY = 'buffetease-guest-reservation-id';

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
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(new Date(dateStr));

  const formatMoney = (amount) => `$${Number(amount || 0).toFixed(0)}`;

  const renderEmptyState = () => {
    const container = document.getElementById('bookings-list');
    if (!container) return;
    container.innerHTML = `
      <div class="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
        <p class="text-slate-500 mb-2">No reservations found.</p>
        <p class="text-slate-400 mb-6 text-sm">Book a package first to see your reservation history here.</p>
        <a href="packages.html" class="inline-block bg-brand-olive text-white rounded-full px-8 py-3 font-semibold">Browse Packages</a>
      </div>
    `;
  };

  const statusClassMap = {
    SUCCESSFUL: 'bg-green-100 text-green-700',
    CONFIRMED: 'bg-emerald-100 text-emerald-700',
    PENDING: 'bg-amber-100 text-amber-700',
    CANCELLED: 'bg-rose-100 text-rose-700',
  };

  const renderBookings = (bookings) => {
    const container = document.getElementById('bookings-list');
    if (!container) return;

    if (!bookings.length) {
      renderEmptyState();
      return;
    }

    container.innerHTML = bookings
      .map((booking) => {
        const statusClass = statusClassMap[booking.status] || statusClassMap.SUCCESSFUL;
        const total = (booking.pkg?.pricePerPerson || 0) * Number(booking.guestCount || 0);
        const imageUrl = booking.pkg?.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(booking.pkg?.name || booking.id)}/400/300`;

        return `
          <div class="bg-white rounded-3xl p-0 shadow overflow-hidden">
            <div class="flex flex-col md:flex-row">
              <div class="w-full md:w-56 h-44 md:h-auto bg-gray-100">
                <img src="${imageUrl}" alt="${booking.pkg?.name || 'Package'}" class="w-full h-full object-cover" referrerpolicy="no-referrer">
              </div>
              <div class="p-8 flex-1 flex flex-col md:flex-row justify-between gap-6">
                <div>
                  <div class="flex items-center gap-3 flex-wrap mb-2">
                    <h3 class="text-2xl serif">${booking.pkg?.name || 'Unknown Package'}</h3>
                    <span class="px-3 py-1 text-xs font-bold rounded-full ${statusClass}">${booking.status}</span>
                  </div>
                  <p class="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-4">${booking.pkg?.type || '-'}</p>
                  <div class="text-gray-600 space-y-1">
                    <p>${booking.session ? formatDate(booking.session.sessionDate) : 'N/A'} • ${booking.session ? `${booking.session.startTime} - ${booking.session.endTime}` : 'N/A'}</p>
                    <p>${booking.guestCount} ${Number(booking.guestCount) === 1 ? 'Guest' : 'Guests'}</p>
                  </div>
                </div>
                <div class="text-left md:text-right">
                  <p class="text-xs uppercase tracking-wider text-gray-400 mb-1">Total Paid</p>
                  <p class="text-3xl font-bold text-brand-olive">${formatMoney(total)}</p>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join('');
  };

  const loadBookings = async () => {
    const container = document.getElementById('bookings-list');
    if (container) container.innerHTML = '<p class="text-center text-gray-500 py-12">Loading your bookings...</p>';

    const guestReservationId = sessionStorage.getItem(GUEST_RESERVATION_KEY);
    if (!guestReservationId) {
      renderEmptyState();
      return;
    }

    try {
      const [reservations, sessions] = await Promise.all([
        requestJson(`${API_BASE_URL}/reservations/user/${guestReservationId}`),
        requestJson(`${API_BASE_URL}/sessions`),
      ]);

      const sessionMap = new Map((sessions || []).map((s) => [String(s.id), s]));
      const packageIds = new Set(
        (reservations || [])
          .map((reservation) => sessionMap.get(String(reservation.sessionId))?.packageId)
          .filter(Boolean),
      );

      const packages = await Promise.all(
        Array.from(packageIds).map((packageId) => requestJson(`${API_BASE_URL}/packages/${packageId}`)),
      );
      const packageMap = new Map(packages.map((pkg) => [String(pkg.id), pkg]));

      const enriched = (reservations || [])
        .map((reservation) => {
          const session = sessionMap.get(String(reservation.sessionId));
          const pkg = session ? packageMap.get(String(session.packageId)) : undefined;
          return { ...reservation, session, pkg };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      renderBookings(enriched);
    } catch (error) {
      if (container) {
        container.innerHTML = '<p class="text-center text-red-600 py-12">Failed to load reservations. Please refresh and try again.</p>';
      }
      console.error(error);
    }
  };

  document.addEventListener('DOMContentLoaded', loadBookings);
})();
