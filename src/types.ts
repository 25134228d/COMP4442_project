export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

export type MealType = 'LUNCH' | 'DINNER' | 'BRUNCH';

export interface BuffetPackage {
  id: string;
  name: string;
  description: string;
  pricePerPerson: number;
  type: MealType;
  imageUrl?: string;
  isActive: boolean;
}

export type SessionStatus = 'OPEN' | 'FULL' | 'CANCELLED';

export interface DiningSession {
  id: string;
  packageId: string;
  sessionDate: string; // ISO Date YYYY-MM-DD
  startTime: string;
  endTime: string;
  maxCapacity: number;
  currentBooked: number;
  status: SessionStatus;
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface Reservation {
  id: string;
  userId: string;
  sessionId: string;
  guestCount: number;
  specialRequest?: string;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
}
