import { BuffetPackage, DiningSession, Reservation } from '../types';
import { api } from './api';

export const BuffetService = {
  async getActivePackages() {
    const { data } = await api.get<BuffetPackage[]>('/api/packages/active');
    return data;
  },

  async getAllPackages() {
    const { data } = await api.get<BuffetPackage[]>('/api/admin/packages');
    return data;
  },

  async getPackageById(id: string) {
    const { data } = await api.get<BuffetPackage>(`/api/packages/${id}`);
    return data;
  },

  async createPackage(pkg: BuffetPackage) {
    const { data } = await api.post<BuffetPackage>('/api/admin/packages', pkg);
    return data;
  },

  async updatePackage(pkg: BuffetPackage) {
    await api.put(`/api/admin/packages/${pkg.id}`, pkg);
    return true;
  },

  async deletePackage(id: string) {
    await api.delete(`/api/admin/packages/${id}`);
    return true;
  },

  async createSession(session: DiningSession) {
    const { data } = await api.post<DiningSession>('/api/admin/sessions', session);
    return data;
  },

  async updateSession(session: DiningSession) {
    await api.put(`/api/admin/sessions/${session.id}`, session);
    return true;
  },

  async getSessionsByPackage(packageId: string, date?: string) {
    const { data } = await api.get<DiningSession[]>('/api/sessions', { params: { packageId, date } });
    return data;
  },

  async getAllSessions() {
    const { data } = await api.get<DiningSession[]>('/api/sessions/all');
    return data;
  },

  async getMyReservations(_userId?: string) {
    const { data } = await api.get<Reservation[]>('/api/reservations/me');
    return data;
  },

  async getAllReservations() {
    const { data } = await api.get<Reservation[]>('/api/admin/reservations');
    return data;
  },

  async createReservation(reservation: Omit<Reservation, 'id' | 'createdAt'>) {
    const { data } = await api.post<Reservation>('/api/reservations', {
      sessionId: reservation.sessionId,
      guestCount: reservation.guestCount,
      specialRequest: reservation.specialRequest,
    });
    return data;
  },

  async updateReservationStatus(id: string, status: 'CONFIRMED' | 'CANCELLED') {
    if (status === 'CONFIRMED') {
      await api.patch(`/api/admin/reservations/${id}/status`, { status });
      return true;
    }

    try {
      await api.patch(`/api/reservations/${id}/status`, { status });
      return true;
    } catch {
      await api.patch(`/api/admin/reservations/${id}/status`, { status });
      return true;
    }
  }
};
