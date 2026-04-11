import React, { useEffect, useState } from 'react';
import { BuffetService } from '../lib/services';
import { BuffetPackage, DiningSession, Reservation } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from '../components/ui/dialog';

type ReservationRow = Reservation & {
  userName: string;
  sessionInfo: string;
};

export function AdminDashboard() {
  const [packages, setPackages] = useState<BuffetPackage[]>([]);
  const [sessions, setSessions] = useState<DiningSession[]>([]);
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [isNewPackageModalOpen, setIsNewPackageModalOpen] = useState(false);
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);

  const [editingPackage, setEditingPackage] = useState<BuffetPackage | null>(null);
  const [editingSession, setEditingSession] = useState<DiningSession | null>(null);

  const [deletingPackage, setDeletingPackage] = useState<BuffetPackage | null>(null);
  const [deletingSession, setDeletingSession] = useState<DiningSession | null>(null);

  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    pricePerPerson: 0,
    isActive: true,
  });

  const [newSession, setNewSession] = useState<{
    packageId: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    maxCapacity: number;
    status: DiningSession['status'];
  }>({
    packageId: '',
    sessionDate: '',
    startTime: '',
    endTime: '',
    maxCapacity: 40,
    status: 'OPEN',
  });

  const [editPackageForm, setEditPackageForm] = useState({
    name: '',
    description: '',
    pricePerPerson: 0,
  });

  const [editSessionForm, setEditSessionForm] = useState<{
    packageId: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    maxCapacity: number;
    status: DiningSession['status'];
  }>({
    packageId: '',
    sessionDate: '',
    startTime: '',
    endTime: '',
    maxCapacity: 40,
    status: 'OPEN',
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const pkgs = await BuffetService.getActivePackages();
      setPackages(pkgs || []);

      const allSessions: DiningSession[] = [];
      for (const pkg of pkgs || []) {
        const s = await BuffetService.getSessionsByPackage(pkg.id);
        if (s) allSessions.push(...s);
      }
      setSessions(allSessions);

      const resDataRaw = await BuffetService.getAllReservations();
      const resData: ReservationRow[] = await Promise.all(
        resDataRaw.map(async (d) => {
          const session = allSessions.find((s) => s.id === d.sessionId);
          return {
            ...d,
            userName: d.userId === 'admin-uid-123' ? 'Admin User' : 'Customer User',
            sessionInfo: session ? `${session.sessionDate} ${session.startTime}` : 'N/A',
          };
        })
      );

      setReservations(
        resData.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmReservation = async (id: string) => {
    try {
      await BuffetService.updateReservationStatus(id, 'CONFIRMED');
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'CONFIRMED' } : r))
      );
      toast.success('Reservation confirmed');
    } catch (error) {
      toast.error('Failed to confirm reservation');
      console.error(error);
    }
  };

  const handleCreatePackage = async () => {
    if (!newPackage.name.trim() || newPackage.pricePerPerson <= 0) {
      toast.error('Please fill in all required package fields properly.');
      return;
    }

    try {
      const createdPkg = await BuffetService.createPackage({
        name: newPackage.name.trim(),
        description: newPackage.description.trim(),
        pricePerPerson: newPackage.pricePerPerson,
        type: 'DINNER',
        imageUrl:
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1000',
        isActive: true,
      });

      if (createdPkg) {
        setPackages((prev) => [...prev, createdPkg]);
        toast.success('Package created successfully');
        setIsNewPackageModalOpen(false);
        setNewPackage({
          name: '',
          description: '',
          pricePerPerson: 0,
          isActive: true,
        });
      }
    } catch (error) {
      toast.error('Failed to create package');
      console.error(error);
    }
  };

  const handleCreateSession = async () => {
    if (
      !newSession.packageId ||
      !newSession.sessionDate ||
      !newSession.startTime ||
      !newSession.endTime ||
      newSession.maxCapacity <= 0
    ) {
      toast.error('Please fill in all session fields properly.');
      return;
    }

    if (newSession.endTime <= newSession.startTime) {
      toast.error('End time must be later than start time.');
      return;
    }

    try {
      const createdSession = await BuffetService.createSession({
        packageId: newSession.packageId,
        sessionDate: newSession.sessionDate,
        startTime: newSession.startTime,
        endTime: newSession.endTime,
        maxCapacity: newSession.maxCapacity,
        currentBooked: 0,
        status: newSession.status,
      });

      if (createdSession) {
        setSessions((prev) => [...prev, createdSession]);
        toast.success('Session created successfully');
        setIsNewSessionModalOpen(false);
        setNewSession({
          packageId: '',
          sessionDate: '',
          startTime: '',
          endTime: '',
          maxCapacity: 40,
          status: 'OPEN',
        });
      }
    } catch (error) {
      toast.error('Failed to create session');
      console.error(error);
    }
  };

  const confirmDeletePackage = async () => {
    if (!deletingPackage) return;

    try {
      await BuffetService.deletePackage(deletingPackage.id);
      setPackages(prev => prev.filter(pkg => pkg.id !== deletingPackage.id));
      setSessions(prev => prev.filter(session => session.packageId !== deletingPackage.id));
      toast.success('Package deleted successfully');
      setDeletingPackage(null);
    } catch (error) {
      toast.error('Failed to delete package');
      console.error(error);
    }
  };

  const openEditPackage = (pkg: BuffetPackage) => {
    setEditingPackage(pkg);
    setEditPackageForm({
      name: pkg.name,
      description: pkg.description,
      pricePerPerson: pkg.pricePerPerson,
    });
  };

  const handleUpdatePackage = async () => {
    if (!editingPackage) return;

    if (!editPackageForm.name.trim() || editPackageForm.pricePerPerson <= 0) {
      toast.error('Please fill in all required package fields properly.');
      return;
    }

    try {
      const updated = await BuffetService.updatePackage(editingPackage.id, {
        name: editPackageForm.name.trim(),
        description: editPackageForm.description.trim(),
        pricePerPerson: editPackageForm.pricePerPerson,
      });

      if (updated) {
        setPackages((prev) =>
          prev.map((pkg) => (pkg.id === updated.id ? updated : pkg))
        );
        toast.success('Package updated successfully');
        setEditingPackage(null);
      }
    } catch (error) {
      toast.error('Failed to update package');
      console.error(error);
    }
  };

  const confirmDeleteSession = async () => {
    if (!deletingSession) return;

    try {
      await BuffetService.deleteSession(deletingSession.id);
      setSessions(prev => prev.filter(session => session.id !== deletingSession.id));
      toast.success('Session deleted successfully');
      setDeletingSession(null);
    } catch (error) {
      toast.error('Failed to delete session');
      console.error(error);
    }
  };

  const openEditSession = (session: DiningSession) => {
    setEditingSession(session);
    setEditSessionForm({
      packageId: session.packageId,
      sessionDate: session.sessionDate,
      startTime: session.startTime,
      endTime: session.endTime,
      maxCapacity: session.maxCapacity,
      status: session.status,
    });
  };

  const handleUpdateSession = async () => {
    if (!editingSession) return;

    if (
      !editSessionForm.packageId ||
      !editSessionForm.sessionDate ||
      !editSessionForm.startTime ||
      !editSessionForm.endTime ||
      editSessionForm.maxCapacity <= 0
    ) {
      toast.error('Please fill in all session fields properly.');
      return;
    }

    if (editSessionForm.endTime <= editSessionForm.startTime) {
      toast.error('End time must be later than start time.');
      return;
    }

    try {
      const updated = await BuffetService.updateSession(editingSession.id, {
        packageId: editSessionForm.packageId,
        sessionDate: editSessionForm.sessionDate,
        startTime: editSessionForm.startTime,
        endTime: editSessionForm.endTime,
        maxCapacity: editSessionForm.maxCapacity,
        status: editSessionForm.status,
      });

      if (updated) {
        setSessions((prev) =>
          prev.map((session) => (session.id === updated.id ? updated : session))
        );
        toast.success('Session updated successfully');
        setEditingSession(null);
      }
    } catch (error) {
      toast.error('Failed to update session');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="container py-20 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl serif mb-12">Admin Dashboard</h1>

      <Tabs defaultValue="reservations" className="space-y-8">
        <TabsList className="bg-white p-1 rounded-full border shadow-sm">
          <TabsTrigger value="reservations" className="rounded-full px-8">
            Reservations
          </TabsTrigger>
          <TabsTrigger value="packages" className="rounded-full px-8">
            Packages
          </TabsTrigger>
          <TabsTrigger value="sessions" className="rounded-full px-8">
            Sessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reservations">
          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((res) => (
                  <TableRow key={res.id}>
                    <TableCell className="font-medium">{res.userName}</TableCell>
                    <TableCell>{res.sessionInfo}</TableCell>
                    <TableCell>{res.guestCount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={res.status === 'CONFIRMED' ? 'default' : 'outline'}
                        className={res.status === 'CONFIRMED' ? 'bg-green-500' : ''}
                      >
                        {res.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {res.status === 'PENDING' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600"
                          onClick={() => handleConfirmReservation(res.id)}
                        >
                          <Check className="h-4 w-4 mr-1" /> Confirm
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="packages">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl serif">Buffet Packages</h2>

            <Dialog open={isNewPackageModalOpen} onOpenChange={setIsNewPackageModalOpen}>
              <DialogTrigger
                render={<Button className="bg-brand-olive rounded-full" />}
              >
                <Plus className="h-4 w-4 mr-2" /> New Package
              </DialogTrigger>

              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Package</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="package-name">Package Name</Label>
                    <Input
                      id="package-name"
                      placeholder="e.g. Seafood Dinner Buffet"
                      value={newPackage.name}
                      onChange={(e) =>
                        setNewPackage({ ...newPackage, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="package-description">Description</Label>
                    <Input
                      id="package-description"
                      placeholder="Describe the package..."
                      value={newPackage.description}
                      onChange={(e) =>
                        setNewPackage({ ...newPackage, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="package-price">Price Per Person ($)</Label>
                    <Input
                      id="package-price"
                      type="number"
                      placeholder="0"
                      value={newPackage.pricePerPerson}
                      onChange={(e) =>
                        setNewPackage({
                          ...newPackage,
                          pricePerPerson: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>
                    Cancel
                  </DialogClose>
                  <Button onClick={handleCreatePackage} className="bg-brand-olive">
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="border-none shadow-md bg-white">
                <CardHeader>
                  <CardTitle className="serif flex justify-between gap-4">
                    <span>{pkg.name}</span>
                    <Badge variant={pkg.isActive ? 'default' : 'secondary'}>
                      {pkg.isActive ? 'Active' : 'Hidden'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                    {pkg.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-brand-olive">
                      ${pkg.pricePerPerson}/pp
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditPackage(pkg)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => setDeletingPackage(pkg)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl serif">Dining Sessions</h2>

            <Dialog open={isNewSessionModalOpen} onOpenChange={setIsNewSessionModalOpen}>
              <DialogTrigger
                render={<Button className="bg-brand-olive rounded-full" />}
              >
                <Plus className="h-4 w-4 mr-2" /> New Session
              </DialogTrigger>

              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>Create New Session</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="session-package">Package</Label>
                    <select
                      id="session-package"
                      value={newSession.packageId}
                      onChange={(e) =>
                        setNewSession({ ...newSession, packageId: e.target.value })
                      }
                      className="w-full rounded-md border border-slate-200 px-3 py-2"
                    >
                      <option value="">Select a package</option>
                      {packages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="session-date">Date</Label>
                    <Input
                      id="session-date"
                      type="date"
                      value={newSession.sessionDate}
                      onChange={(e) =>
                        setNewSession({ ...newSession, sessionDate: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="session-start">Start Time</Label>
                      <Input
                        id="session-start"
                        type="time"
                        value={newSession.startTime}
                        onChange={(e) =>
                          setNewSession({ ...newSession, startTime: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="session-end">End Time</Label>
                      <Input
                        id="session-end"
                        type="time"
                        value={newSession.endTime}
                        onChange={(e) =>
                          setNewSession({ ...newSession, endTime: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="session-capacity">Capacity</Label>
                    <Input
                      id="session-capacity"
                      type="number"
                      min="1"
                      value={newSession.maxCapacity}
                      onChange={(e) =>
                        setNewSession({
                          ...newSession,
                          maxCapacity: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>
                    Cancel
                  </DialogClose>
                  <Button onClick={handleCreateSession} className="bg-brand-olive">
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>{session.sessionDate}</TableCell>
                    <TableCell>
                      {session.startTime} - {session.endTime}
                    </TableCell>
                    <TableCell>
                      {session.currentBooked} / {session.maxCapacity}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={session.status === 'OPEN' ? 'outline' : 'secondary'}
                      >
                        {session.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditSession(session)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500"
                          onClick={() => setDeletingSession(session)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!editingPackage}
        onOpenChange={(open) => !open && setEditingPackage(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-package-name">Package Name</Label>
              <Input
                id="edit-package-name"
                value={editPackageForm.name}
                onChange={(e) =>
                  setEditPackageForm({ ...editPackageForm, name: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-package-description">Description</Label>
              <Input
                id="edit-package-description"
                value={editPackageForm.description}
                onChange={(e) =>
                  setEditPackageForm({
                    ...editPackageForm,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-package-price">Price Per Person</Label>
              <Input
                id="edit-package-price"
                type="number"
                value={editPackageForm.pricePerPerson}
                onChange={(e) =>
                  setEditPackageForm({
                    ...editPackageForm,
                    pricePerPerson: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button onClick={handleUpdatePackage} className="bg-brand-olive">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deletingPackage}
        onOpenChange={(open) => !open && setDeletingPackage(null)}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete Package</DialogTitle>
          </DialogHeader>

          <div className="py-2 text-sm text-slate-600">
            Are you sure you want to delete
            <span className="font-semibold text-slate-900"> {deletingPackage?.name}</span>?
            This will also remove related sessions.
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              onClick={confirmDeletePackage}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingSession}
        onOpenChange={(open) => !open && setEditingSession(null)}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-session-package">Package</Label>
              <select
                id="edit-session-package"
                value={editSessionForm.packageId}
                onChange={(e) =>
                  setEditSessionForm({
                    ...editSessionForm,
                    packageId: e.target.value,
                  })
                }
                className="w-full rounded-md border border-slate-200 px-3 py-2"
              >
                <option value="">Select a package</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-session-date">Date</Label>
              <Input
                id="edit-session-date"
                type="date"
                value={editSessionForm.sessionDate}
                onChange={(e) =>
                  setEditSessionForm({
                    ...editSessionForm,
                    sessionDate: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-session-start">Start Time</Label>
                <Input
                  id="edit-session-start"
                  type="time"
                  value={editSessionForm.startTime}
                  onChange={(e) =>
                    setEditSessionForm({
                      ...editSessionForm,
                      startTime: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-session-end">End Time</Label>
                <Input
                  id="edit-session-end"
                  type="time"
                  value={editSessionForm.endTime}
                  onChange={(e) =>
                    setEditSessionForm({
                      ...editSessionForm,
                      endTime: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-session-capacity">Capacity</Label>
              <Input
                id="edit-session-capacity"
                type="number"
                min="1"
                value={editSessionForm.maxCapacity}
                onChange={(e) =>
                  setEditSessionForm({
                    ...editSessionForm,
                    maxCapacity: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button onClick={handleUpdateSession} className="bg-brand-olive">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deletingSession}
        onOpenChange={(open) => !open && setDeletingSession(null)}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
          </DialogHeader>

          <div className="py-2 text-sm text-slate-600">
            Are you sure you want to delete this session on
            <span className="font-semibold text-slate-900">
              {' '}{deletingSession?.sessionDate}
            </span>
            {' '}at
            <span className="font-semibold text-slate-900">
              {' '}{deletingSession?.startTime}
            </span>
            ?
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              onClick={confirmDeleteSession}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}