import { BuffetPackage, DiningSession, Reservation } from '../types';

// Mock Data
const INITIAL_MOCK_PACKAGES: BuffetPackage[] = [
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

const getMockPackages = (): BuffetPackage[] => {
  const stored = localStorage.getItem('mockPackages');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('mockPackages', JSON.stringify(INITIAL_MOCK_PACKAGES));
  return INITIAL_MOCK_PACKAGES;
};

// Helper to initialize mock sessions
const getMockSessions = (): DiningSession[] => {
  const stored = localStorage.getItem('mockSessions');
  if (stored) return JSON.parse(stored);

  const sessions: DiningSession[] = [];
  INITIAL_MOCK_PACKAGES.forEach(pkg => {
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
    return getMockPackages().filter(p => p.isActive);
  },

  async getAllPackages() {
    return getMockPackages();
  },

  async getPackageById(id: string) {
    return getMockPackages().find(p => p.id === id);
  },

  async createPackage(pkg: BuffetPackage) {
    const packages = getMockPackages();
    packages.unshift(pkg);
    try {
      localStorage.setItem('mockPackages', JSON.stringify(packages));
    } catch (e) {
      console.error("Storage quota exceeded", e);
      throw new Error("Storage quota exceeded. Please try uploading a smaller image.");
    }
    return pkg;
  },

  async updatePackage(pkg: BuffetPackage) {
    const packages = getMockPackages();
    const index = packages.findIndex(p => p.id === pkg.id);
    if (index !== -1) {
      packages[index] = pkg;
      try {
        localStorage.setItem('mockPackages', JSON.stringify(packages));
        return true;
      } catch (e) {
        console.error("Storage quota exceeded", e);
        throw new Error("Storage quota exceeded. Please try uploading a smaller image.");
      }
    }
    return false;
  },

  async deletePackage(id: string) {
    const packages = getMockPackages();
    const filtered = packages.filter(p => p.id !== id);
    if (filtered.length !== packages.length) {
      localStorage.setItem('mockPackages', JSON.stringify(filtered));
      return true;
    }
    return false;
  },

  async createSession(session: DiningSession) {
    const sessions = getMockSessions();
    sessions.unshift(session);
    localStorage.setItem('mockSessions', JSON.stringify(sessions));
    return session;
  },

  async updateSession(session: DiningSession) {
    const sessions = getMockSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    if (index !== -1) {
      sessions[index] = session;
      localStorage.setItem('mockSessions', JSON.stringify(sessions));
      return true;
    }
    return false;
  },

  async getSessionsByPackage(packageId: string, date?: string) {
    const sessions = getMockSessions();
    return sessions.filter(s => 
      s.packageId === packageId && (!date || s.sessionDate === date)
    );
  },

  async getAllSessions() {
    return getMockSessions();
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
      if (sessions[sessionIndex].currentBooked >= sessions[sessionIndex].maxCapacity) {
        sessions[sessionIndex].status = 'FULL';
      }
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
          if (sessions[sessionIndex].currentBooked < sessions[sessionIndex].maxCapacity && sessions[sessionIndex].status === 'FULL') {
            sessions[sessionIndex].status = 'OPEN';
          }
          localStorage.setItem('mockSessions', JSON.stringify(sessions));
        }
      }
      
      localStorage.setItem('mockReservations', JSON.stringify(reservations));
      return true;
    }
    return false;
  }
};