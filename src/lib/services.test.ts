import { describe, expect, it, vi } from 'vitest';
import { BuffetPackage, DiningSession, Reservation } from '../types';

const testPackage: BuffetPackage = {
  id: 'pkg-test',
  name: 'Test Package',
  description: 'Test Description',
  pricePerPerson: 50,
  type: 'DINNER',
  imageUrl: 'https://example.com/test.jpg',
  isActive: true,
};

const testSession: DiningSession = {
  id: 'session-test',
  packageId: testPackage.id,
  sessionDate: '2099-12-31',
  startTime: '18:00',
  endTime: '20:00',
  maxCapacity: 10,
  currentBooked: 0,
  status: 'OPEN',
};

const seedReservations = (reservations: Reservation[]) => {
  localStorage.setItem('mockReservations', JSON.stringify(reservations));
};

const getBuffetService = async () => {
  vi.resetModules();
  const module = await import('./services');
  return module.BuffetService;
};

describe('BuffetService package operations', () => {
  it('initializes default packages and returns active ones', async () => {
    const BuffetService = await getBuffetService();
    const active = await BuffetService.getActivePackages();

    expect(active.length).toBeGreaterThan(0);
    expect(active.every((pkg) => pkg.isActive)).toBe(true);
    expect(localStorage.getItem('mockPackages')).not.toBeNull();
  });

  it('creates and retrieves a package', async () => {
    const BuffetService = await getBuffetService();
    await BuffetService.createPackage(testPackage);
    const loaded = await BuffetService.getPackageById(testPackage.id);
    const all = await BuffetService.getAllPackages();

    expect(loaded).toEqual(testPackage);
    expect(all.some((pkg) => pkg.id === testPackage.id)).toBe(true);
  });

  it('updates and deletes an existing package', async () => {
    const BuffetService = await getBuffetService();
    await BuffetService.createPackage(testPackage);
    const updated = { ...testPackage, name: 'Updated Name' };

    expect(await BuffetService.updatePackage(updated)).toBe(true);
    expect(await BuffetService.getPackageById(testPackage.id)).toEqual(updated);
    expect(await BuffetService.deletePackage(testPackage.id)).toBe(true);
    expect(await BuffetService.getPackageById(testPackage.id)).toBeUndefined();
  });

  it('returns false when updating or deleting a missing package', async () => {
    const BuffetService = await getBuffetService();
    const missing = { ...testPackage, id: 'pkg-missing' };
    expect(await BuffetService.updatePackage(missing)).toBe(false);
    expect(await BuffetService.deletePackage('pkg-missing')).toBe(false);
  });

  it('throws a helpful error when package storage write fails', async () => {
    const BuffetService = await getBuffetService();
    localStorage.setItem('mockPackages', JSON.stringify([testPackage]));
    const setItemSpy = vi.spyOn(localStorage, 'setItem');

    setItemSpy.mockImplementationOnce(() => {
      throw new Error('quota');
    });
    await expect(BuffetService.createPackage({ ...testPackage, id: 'pkg-new' })).rejects.toThrow(
      'Storage quota exceeded. Please try uploading a smaller image.',
    );

    setItemSpy.mockImplementationOnce(() => {
      throw new Error('quota');
    });
    await expect(BuffetService.updatePackage(testPackage)).rejects.toThrow(
      'Storage quota exceeded. Please try uploading a smaller image.',
    );

    setItemSpy.mockRestore();
  });
});

describe('BuffetService session operations', () => {
  it('creates and updates sessions', async () => {
    const BuffetService = await getBuffetService();
    await BuffetService.createSession(testSession);

    const updated = { ...testSession, status: 'FULL' as const, currentBooked: 10 };
    expect(await BuffetService.updateSession(updated)).toBe(true);

    const sessions = await BuffetService.getSessionsByPackage(testPackage.id);
    expect(sessions).toContainEqual(updated);
  });

  it('returns false when updating a missing session', async () => {
    const BuffetService = await getBuffetService();
    expect(await BuffetService.updateSession(testSession)).toBe(false);
  });

  it('filters sessions by package and date', async () => {
    const BuffetService = await getBuffetService();
    await BuffetService.createSession(testSession);
    await BuffetService.createSession({ ...testSession, id: 'session-other', sessionDate: '2099-10-10' });
    await BuffetService.createSession({ ...testSession, id: 'session-diff-pkg', packageId: 'pkg-other' });

    const byDate = await BuffetService.getSessionsByPackage(testPackage.id, '2099-12-31');
    expect(byDate).toHaveLength(1);
    expect(byDate[0].id).toBe('session-test');
  });
});

describe('BuffetService reservation operations', () => {
  it('creates reservation and updates session capacity/status', async () => {
    const BuffetService = await getBuffetService();
    await BuffetService.createSession({ ...testSession, maxCapacity: 4 });

    const created = await BuffetService.createReservation({
      userId: 'user-1',
      sessionId: testSession.id,
      guestCount: 4,
      status: 'PENDING',
      updatedAt: new Date().toISOString(),
    });

    expect(created.id).toMatch(/^res-\d+$/);
    expect(created.createdAt).toBeTruthy();

    const sessions = await BuffetService.getAllSessions();
    const session = sessions.find((s) => s.id === testSession.id);
    expect(session?.currentBooked).toBe(4);
    expect(session?.status).toBe('FULL');
  });

  it('cancels reservation and reopens full sessions', async () => {
    const BuffetService = await getBuffetService();
    localStorage.setItem(
      'mockSessions',
      JSON.stringify([
        {
          ...testSession,
          currentBooked: 6,
          maxCapacity: 6,
          status: 'FULL',
        },
      ]),
    );
    seedReservations([
      {
        id: 'res-1',
        userId: 'user-1',
        sessionId: testSession.id,
        guestCount: 2,
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    expect(await BuffetService.updateReservationStatus('res-1', 'CANCELLED')).toBe(true);

    const sessions = await BuffetService.getAllSessions();
    expect(sessions[0].currentBooked).toBe(4);
    expect(sessions[0].status).toBe('OPEN');
  });

  it('returns user reservations and handles missing reservation updates', async () => {
    const BuffetService = await getBuffetService();
    seedReservations([
      {
        id: 'res-u1',
        userId: 'user-1',
        sessionId: 's1',
        guestCount: 2,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'res-u2',
        userId: 'user-2',
        sessionId: 's2',
        guestCount: 4,
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    const mine = await BuffetService.getMyReservations('user-1');
    const all = await BuffetService.getAllReservations();
    expect(mine).toHaveLength(1);
    expect(mine[0].id).toBe('res-u1');
    expect(all).toHaveLength(2);
    expect(await BuffetService.updateReservationStatus('missing-id', 'CANCELLED')).toBe(false);
  });
});
