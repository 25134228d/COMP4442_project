import axios from 'axios';
import { BuffetPackage, DiningSession, Reservation } from '../types';

// 設定基礎 API 路徑 (對應到你的 Spring Boot Controller)
const API_BASE_URL = '/api';

export const BuffetService = {
  // ============================
  // Package (方案) 相關 API
  // ============================

  async getActivePackages(): Promise<BuffetPackage[]> {
    // 假設後端有提供 /api/packages/active 的接口
    // 或者可以從前端過濾： const res = await this.getAllPackages(); return res.filter(p => p.isActive);
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

  // ============================
  // Session (場次) 相關 API
  // ============================

  async getAllSessions(): Promise<DiningSession[]> {
    const response = await axios.get(`${API_BASE_URL}/sessions`);
    return response.data;
  },

  async getSessionsByPackage(packageId: string, date?: string): Promise<DiningSession[]> {
    // 透過 Query Parameter 傳遞過濾條件
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

  // ============================
  // Reservation (預訂) 相關 API
  // ============================

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