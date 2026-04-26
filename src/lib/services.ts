import axios from 'axios';
import { BuffetPackage, DiningSession, Reservation } from '../types';

// Setting the base URL for API calls (should match your Spring Boot Controller's mapping)
const API_BASE_URL = '/api';
const GUEST_RESERVATION_KEY = 'buffetease-guest-reservation-id';

const createGuestReservationId = () =>
  `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const GuestReservationSession = {
  getGuestId(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(GUEST_RESERVATION_KEY);
  },

  getOrCreateGuestId(): string {
    const existing = this.getGuestId();
    if (existing) return existing;

    const generated = createGuestReservationId();
    sessionStorage.setItem(GUEST_RESERVATION_KEY, generated);
    return generated;
  },
};

export const BuffetService = {

  // Package related API

  async getActivePackages(): Promise<BuffetPackage[]> {
    // As backend should ideally handle this filtering to reduce data transfer and improve performance.
    const response = await axios.get(`${API_BASE_URL}/packages/active`);
    return response.data;
  },

  async getAllPackages(): Promise<BuffetPackage[]> {
    const response = await axios.get(`${API_BASE_URL}/packages`);
    return response.data;
  },

  async getPackageById(id: string): Promise<BuffetPackage> {
    const response = await axios.get(`${API_BASE_URL}/packages/${id}`);
    return response.data;
  },

  async createPackage(pkg: Omit<BuffetPackage, 'id'>): Promise<BuffetPackage> {
    const response = await axios.post(`${API_BASE_URL}/packages`, pkg);
    return response.data;
  },

  async updatePackage(pkg: BuffetPackage): Promise<boolean> {
    try {
      await axios.put(`${API_BASE_URL}/packages/${pkg.id}`, pkg);
      return true;
    } catch (e) {
      console.error("Failed to update package", e);
      return false;
    }
  },

  async deletePackage(id: string): Promise<boolean> {
    try {
      await axios.delete(`${API_BASE_URL}/packages/${id}`);
      return true;
    } catch (e) {
      return false;
    }
  },

  // Session related API
  async getAllSessions(): Promise<DiningSession[]> {
    const response = await axios.get(`${API_BASE_URL}/sessions`);
    return response.data;
  },

  async getSessionsByPackage(packageId: string, date?: string): Promise<DiningSession[]> {
    // Filtering data through query parameters
    const params = new URLSearchParams();
    if (date) params.append('date', date);

    const response = await axios.get(`${API_BASE_URL}/sessions/package/${packageId}?${params.toString()}`);
    return response.data;
  },

  async createSession(session: Omit<DiningSession, 'id'>): Promise<DiningSession> {
    const response = await axios.post(`${API_BASE_URL}/sessions`, session);
    return response.data;
  },

  async updateSession(session: DiningSession): Promise<boolean> {
    try {
      await axios.put(`${API_BASE_URL}/sessions/${session.id}`, session);
      return true;
    } catch (e) {
      return false;
    }
  },

  // Reservation related API
  async getAllReservations(): Promise<Reservation[]> {
    const response = await axios.get(`${API_BASE_URL}/reservations`);
    return response.data;
  },

  async getMyReservations(userId: string): Promise<Reservation[]> {
    const response = await axios.get(`${API_BASE_URL}/reservations/user/${userId}`);
    return response.data;
  },

  async createReservation(reservation: Omit<Reservation, 'id' | 'createdAt'>): Promise<Reservation> {
    const response = await axios.post(`${API_BASE_URL}/reservations`, reservation);
    return response.data;
  },

  async updateReservationStatus(id: string, status: 'CONFIRMED' | 'CANCELLED' | 'PENDING'): Promise<boolean> {
    try {
      await axios.patch(`${API_BASE_URL}/reservations/${id}/status`, { status });
      return true;
    } catch (e) {
      return false;
    }
  }
};