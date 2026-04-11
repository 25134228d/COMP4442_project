import { BuffetPackage, DiningSession, Reservation } from '../types';

// Mock Data
const MOCK_PACKAGES: BuffetPackage[] = [
  {
    id: 'pkg-1',
    name: 'Ocean Bounty Seafood Night',
    description: 'A premium selection of fresh oysters, lobsters, and grilled fish. Every Friday night.',
    pricePerPerson: 85,
    type: 'DINNER',
    imageUrl: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&q=80&w=1000',
    isActive: true
  },
  {
    id: 'pkg-2',
    name: 'Artisanal Sunday Brunch',
    description: 'Handcrafted pastries, organic eggs, and bottomless mimosas in a sun-drenched setting.',
    pricePerPerson: 45,
    type: 'BRUNCH',
    imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&q=80&w=1000',
    isActive: true
  },
  {
    id: 'pkg-3',
    name: 'Global Flavors Lunch',
    description: 'A rotating selection of international cuisines, from Thai curries to Italian pastas.',
    pricePerPerson: 32,
    type: 'LUNCH',
    imageUrl: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&q=80&w=1000',
    isActive: true
  }
];

// Helper to initialize mock sessions
const getMockSessions = (): DiningSession[] => {
  const stored = localStorage.getItem('mockSessions');
  if (stored) return JSON.parse(stored);

  const sessions: DiningSession[] = [];
  MOCK_PACKAGES.forEach(pkg => {
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      sessions.push({
        id: `session-${pkg.id}-${i}`,
        packageId: pkg.id,
        sessionDate: dateStr,
        startTime: pkg.type === 'DINNER' ? '18:00' : pkg.type === 'BRUNCH' ? '10:00' : '12:00',
        endTime: pkg.type === 'DINNER' ? '21:00' : pkg.type === 'BRUNCH' ? '14:00' : '15:00',
        maxCapacity: 40,
        currentBooked: 0,
        status: 'OPEN'
      });
    }
  });
  localStorage.setItem('mockSessions', JSON.stringify(sessions));
  return sessions;
};

// Helper to get mock reservations
const getMockReservations = (): Reservation[] => {
  const stored = localStorage.getItem('mockReservations');
  return stored ? JSON.parse(stored) : [];
};

export const BuffetService = {
  async getActivePackages() {
    return MOCK_PACKAGES.filter(p => p.isActive);
  },

  async getPackageById(id: string) {
    return MOCK_PACKAGES.find(p => p.id === id);
  },

  async getSessionsByPackage(packageId: string, date?: string) {
    const sessions = getMockSessions();
    return sessions.filter(s => 
      s.packageId === packageId && (!date || s.sessionDate === date)
    );
  },

  async getMyReservations(userId: string) {
    const reservations = getMockReservations();
    return reservations.filter(r => r.userId === userId);
  },

  async getAllReservations() {
    return getMockReservations();
  },

  async createReservation(reservation: Omit<Reservation, 'id' | 'createdAt'>) {
    const reservations = getMockReservations();
    const newReservation: Reservation = {
      ...reservation,
      id: `res-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    // Update session capacity
    const sessions = getMockSessions();
    const sessionIndex = sessions.findIndex(s => s.id === reservation.sessionId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].currentBooked += reservation.guestCount;
      localStorage.setItem('mockSessions', JSON.stringify(sessions));
    }

    reservations.push(newReservation);
    localStorage.setItem('mockReservations', JSON.stringify(reservations));
    return newReservation;
  },

  async updateReservationStatus(id: string, status: 'CONFIRMED' | 'CANCELLED') {
    const reservations = getMockReservations();
    const index = reservations.findIndex(r => r.id === id);
    if (index !== -1) {
      const oldStatus = reservations[index].status;
      reservations[index].status = status;
      
      // Update capacity if cancelling
      if (oldStatus !== 'CANCELLED' && status === 'CANCELLED') {
        const sessions = getMockSessions();
        const sessionIndex = sessions.findIndex(s => s.id === reservations[index].sessionId);
        if (sessionIndex !== -1) {
          sessions[sessionIndex].currentBooked -= reservations[index].guestCount;
          localStorage.setItem('mockSessions', JSON.stringify(sessions));
        }
      }
      
      localStorage.setItem('mockReservations', JSON.stringify(reservations));
      return true;
    }
    return false;
  }
};
