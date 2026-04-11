import { BuffetPackage, DiningSession, Reservation } from '../types';

// Initial default data
const DEFAULT_PACKAGES: BuffetPackage[] = [
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

// Helper to initialize/get mock packages
const getMockPackages = (): BuffetPackage[] => {
  const stored = localStorage.getItem('mockPackages');
  if (stored) return JSON.parse(stored);

  localStorage.setItem('mockPackages', JSON.stringify(DEFAULT_PACKAGES));
  return DEFAULT_PACKAGES;
};

// Helper to initialize/get mock sessions
const getMockSessions = (): DiningSession[] => {
  const stored = localStorage.getItem('mockSessions');
  if (stored) return JSON.parse(stored);

  const packages = getMockPackages();
  const sessions: DiningSession[] = [];

  packages.forEach(pkg => {
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
    const packages = getMockPackages();
    return packages.filter(p => p.isActive);
  },

  async getPackageById(id: string) {
    const packages = getMockPackages();
    return packages.find(p => p.id === id);
  },

  async getSessionsByPackage(packageId: string, date?: string) {
    const sessions = getMockSessions();
    return sessions.filter(
      s => s.packageId === packageId && (!date || s.sessionDate === date)
    );
  },

  async getMyReservations(userId: string) {
    const reservations = getMockReservations();
    return reservations.filter(r => r.userId === userId);
  },

  async getAllReservations() {
    return getMockReservations();
  },

  async createPackage(
    packageData: Omit<BuffetPackage, 'id'>
  ) {
    const packages = getMockPackages();

    const newPackage: BuffetPackage = {
      id: `pkg-${Date.now()}`,
      ...packageData
    };

    packages.push(newPackage);
    localStorage.setItem('mockPackages', JSON.stringify(packages));

    // Optional: auto create 7 sessions for the new package
    const sessions = getMockSessions();
    const newSessions: DiningSession[] = [];

    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      newSessions.push({
        id: `session-${newPackage.id}-${i}`,
        packageId: newPackage.id,
        sessionDate: dateStr,
        startTime: newPackage.type === 'DINNER' ? '18:00' : newPackage.type === 'BRUNCH' ? '10:00' : '12:00',
        endTime: newPackage.type === 'DINNER' ? '21:00' : newPackage.type === 'BRUNCH' ? '14:00' : '15:00',
        maxCapacity: 40,
        currentBooked: 0,
        status: 'OPEN'
      });
    }

    localStorage.setItem('mockSessions', JSON.stringify([...sessions, ...newSessions]));

    return newPackage;
  },

  async createSession(sessionData: Omit<DiningSession, 'id'>) {
    const sessions = getMockSessions();

    const newSession: DiningSession = {
      id: `session-${Date.now()}`,
      ...sessionData,
    };

    sessions.push(newSession);
    localStorage.setItem('mockSessions', JSON.stringify(sessions));
    return newSession;
  },

  async updatePackage(id: string, updates: Partial<BuffetPackage>) {
    const packages = getMockPackages();
    const index = packages.findIndex(p => p.id === id);

    if (index === -1) return null;

    packages[index] = {
      ...packages[index],
      ...updates,
    };

    localStorage.setItem('mockPackages', JSON.stringify(packages));
    return packages[index];
  },

  async deletePackage(id: string) {
    const packages = getMockPackages();
    const updatedPackages = packages.filter(p => p.id !== id);
    localStorage.setItem('mockPackages', JSON.stringify(updatedPackages));

    const sessions = getMockSessions();
    const updatedSessions = sessions.filter(s => s.packageId !== id);
    localStorage.setItem('mockSessions', JSON.stringify(updatedSessions));

    return true;
  },

  async updateSession(id: string, updates: Partial<DiningSession>) {
    const sessions = getMockSessions();
    const index = sessions.findIndex(s => s.id === id);

    if (index === -1) return null;

    sessions[index] = {
      ...sessions[index],
      ...updates,
    };

    localStorage.setItem('mockSessions', JSON.stringify(sessions));
    return sessions[index];
  },

  async deleteSession(id: string) {
    const sessions = getMockSessions();
    const updatedSessions = sessions.filter(s => s.id !== id);
    localStorage.setItem('mockSessions', JSON.stringify(updatedSessions));
    return true;
  },

  async createReservation(reservation: Omit<Reservation, 'id' | 'createdAt'>) {
    const reservations = getMockReservations();

    const newReservation: Reservation = {
      ...reservation,
      id: `res-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

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