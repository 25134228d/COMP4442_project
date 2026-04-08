import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

export async function seedInitialData() {
  const pkgSnap = await getDocs(collection(db, 'packages'));
  if (!pkgSnap.empty) return; // Already seeded

  console.log('Seeding initial data...');

  const packages = [
    {
      name: 'Ocean Bounty Seafood Night',
      description: 'A premium selection of fresh oysters, lobsters, and grilled fish. Every Friday night.',
      pricePerPerson: 85,
      type: 'DINNER',
      imageUrl: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&q=80&w=1000',
      isActive: true
    },
    {
      name: 'Artisanal Sunday Brunch',
      description: 'Handcrafted pastries, organic eggs, and bottomless mimosas in a sun-drenched setting.',
      pricePerPerson: 45,
      type: 'BRUNCH',
      imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&q=80&w=1000',
      isActive: true
    },
    {
      name: 'Global Flavors Lunch',
      description: 'A rotating selection of international cuisines, from Thai curries to Italian pastas.',
      pricePerPerson: 32,
      type: 'LUNCH',
      imageUrl: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&q=80&w=1000',
      isActive: true
    }
  ];

  for (const pkg of packages) {
    const docRef = await addDoc(collection(db, 'packages'), pkg);
    
    // Add some sessions for the next 7 days
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      await addDoc(collection(db, 'sessions'), {
        packageId: docRef.id,
        sessionDate: dateStr,
        startTime: pkg.type === 'DINNER' ? '18:00' : pkg.type === 'BRUNCH' ? '10:00' : '12:00',
        endTime: pkg.type === 'DINNER' ? '21:00' : pkg.type === 'BRUNCH' ? '14:00' : '15:00',
        maxCapacity: 40,
        currentBooked: 0,
        status: 'OPEN'
      });
    }
  }

  console.log('Seeding complete.');
}
