import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { BuffetPackage, DiningSession, Reservation } from '../types';

export const BuffetService = {
  async getActivePackages() {
    const path = 'packages';
    try {
      const q = query(collection(db, path), where('isActive', '==', true));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BuffetPackage));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getSessionsByPackage(packageId: string, date?: string) {
    const path = 'sessions';
    try {
      let q = query(collection(db, path), where('packageId', '==', packageId));
      if (date) {
        q = query(q, where('sessionDate', '==', date));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DiningSession));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getMyReservations(userId: string) {
    const path = 'reservations';
    try {
      const q = query(collection(db, path), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }
};
