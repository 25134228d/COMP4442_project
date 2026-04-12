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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Check, X, ArrowUpDown, Upload } from 'lucide-react';

export function AdminDashboard() {
  const [packages, setPackages] = useState<BuffetPackage[]>([]);
  const [sessions, setSessions] = useState<DiningSession[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sorting and filtering state for reservations
  const [resSortField, setResSortField] = useState<'date' | 'name' | 'status'>('date');
  const [resSortOrder, setResSortOrder] = useState<'asc' | 'desc'>('desc');
  const [resStartDate, setResStartDate] = useState('');
  const [resEndDate, setResEndDate] = useState('');
  const [resStatusFilter, setResStatusFilter] = useState('ALL');

  // Filtering and sorting state for sessions
  const [sessionStartDate, setSessionStartDate] = useState('');
  const [sessionEndDate, setSessionEndDate] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState('');
  const [sessionEndTime, setSessionEndTime] = useState('');
  const [sessionStatusFilter, setSessionStatusFilter] = useState('ALL');
  const [sessionPackageFilter, setSessionPackageFilter] = useState('ALL');
  const [sessionSortField, setSessionSortField] = useState<'date' | 'capacity' | 'package' | 'time'>('date');
  const [sessionSortOrder, setSessionSortOrder] = useState<'asc' | 'desc'>('desc');

  const [deletePackageId, setDeletePackageId] = useState<string | null>(null);
  
  // Package state
  const [isCreatePackageOpen, setIsCreatePackageOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<BuffetPackage | null>(null);
  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    pricePerPerson: 0,
    isActive: true,
    imageUrl: '',
    type: 'DINNER'
  });

  // Session state
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<DiningSession | null>(null);
  const [newSession, setNewSession] = useState({
    packageId: '',
    sessionDate: '',
    startTime: '',
    endTime: '',
    maxCapacity: 50,
    status: 'OPEN'
  });

  useEffect(() => {
    const fetchData = async () => {
      const pkgs = await BuffetService.getAllPackages();
      setPackages(pkgs || []);

      const allSessions = await BuffetService.getAllSessions();
      setSessions(allSessions || []);

      const resDataRaw = await BuffetService.getAllReservations();
      const resData = await Promise.all(resDataRaw.map(async (d) => {
        const session = allSessions.find(s => s.id === d.sessionId);
        return { 
          id: d.id, 
          ...d, 
          userName: d.userId === 'admin-uid-123' ? 'Admin User' : 'Customer User', // Mock user name
          sessionInfo: session ? `${session.sessionDate} ${session.startTime}` : 'N/A',
          dateForSort: session ? session.sessionDate : d.createdAt
        };
      }));
      setReservations(resData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const confirmDeletePackage = async () => {
    if (!deletePackageId) return;
    await BuffetService.deletePackage(deletePackageId);
    setPackages(prev => prev.filter(p => p.id !== deletePackageId));
    toast.success('Package deleted successfully');
    setDeletePackageId(null);
  };

  const handleCreateSession = async () => {
    if (!newSession.packageId || !newSession.sessionDate || !newSession.startTime || !newSession.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (newSession.maxCapacity <= 0) {
      toast.error('Max capacity must be a positive number');
      return;
    }
    if (newSession.startTime >= newSession.endTime) {
      toast.error('End time must be after start time');
      return;
    }
    const session: DiningSession = {
      id: `session-${Date.now()}`,
      packageId: newSession.packageId,
      sessionDate: newSession.sessionDate,
      startTime: newSession.startTime,
      endTime: newSession.endTime,
      maxCapacity: Number(newSession.maxCapacity),
      currentBooked: 0,
      status: newSession.status as 'OPEN' | 'FULL' | 'CANCELLED'
    };
    
    const createdSession = await BuffetService.createSession(session);
    setSessions(prev => [createdSession, ...prev]);
    toast.success('Session created successfully');
    setIsCreateSessionOpen(false);
    setNewSession({ packageId: '', sessionDate: '', startTime: '', endTime: '', maxCapacity: 50, status: 'OPEN' });
  };

  const handleUpdateSession = async () => {
    if (!editingSession) return;
    if (!editingSession.packageId || !editingSession.sessionDate || !editingSession.startTime || !editingSession.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (editingSession.maxCapacity <= 0) {
      toast.error('Max capacity must be a positive number');
      return;
    }
    if (editingSession.startTime >= editingSession.endTime) {
      toast.error('End time must be after start time');
      return;
    }
    
    await BuffetService.updateSession(editingSession);
    setSessions(prev => prev.map(s => s.id === editingSession.id ? editingSession : s));
    toast.success('Session updated successfully');
    setEditingSession(null);
  };

  const handleCreatePackage = async () => {
    if (!newPackage.name || !newPackage.description || newPackage.pricePerPerson <= 0) {
      toast.error('Please fill in all required fields correctly');
      return;
    }
    const pkg: BuffetPackage = {
      id: `pkg-${Date.now()}`,
      name: newPackage.name,
      description: newPackage.description,
      pricePerPerson: Number(newPackage.pricePerPerson),
      isActive: newPackage.isActive,
      imageUrl: newPackage.imageUrl || `https://picsum.photos/seed/${newPackage.name}/400/300`,
      type: newPackage.type as 'BRUNCH' | 'LUNCH' | 'DINNER'
    };
    
    try {
      const createdPkg = await BuffetService.createPackage(pkg);
      setPackages(prev => [createdPkg, ...prev]);
      toast.success('Package created successfully');
      setIsCreatePackageOpen(false);
      setNewPackage({ name: '', description: '', pricePerPerson: 0, isActive: true, imageUrl: '', type: 'DINNER' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create package');
    }
  };

  const handleUpdatePackage = async () => {
    if (!editingPackage) return;
    if (!editingPackage.name || !editingPackage.description || editingPackage.pricePerPerson <= 0) {
      toast.error('Please fill in all required fields correctly');
      return;
    }
    try {
      await BuffetService.updatePackage(editingPackage);
      setPackages(prev => prev.map(p => p.id === editingPackage.id ? editingPackage : p));
      toast.success('Package updated successfully');
      setEditingPackage(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update package');
    }
  };

  const processImage = (file: File, callback: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 400;
        
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
        callback(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file, (dataUrl) => setNewPackage({ ...newPackage, imageUrl: dataUrl }));
    }
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingPackage) {
      processImage(file, (dataUrl) => setEditingPackage({ ...editingPackage, imageUrl: dataUrl }));
    }
  };

  const handleSessionSort = (field: 'date' | 'capacity' | 'package' | 'time') => {
    if (sessionSortField === field) {
      setSessionSortOrder(sessionSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSessionSortField(field);
      setSessionSortOrder('asc');
    }
  };

  const handleConfirmReservation = async (id: string) => {
    await BuffetService.updateReservationStatus(id, 'CONFIRMED');
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'CONFIRMED' } : r));
    toast.success('Reservation confirmed');
  };

  const handleSort = (field: 'date' | 'name' | 'status') => {
    if (resSortField === field) {
      setResSortOrder(resSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setResSortField(field);
      setResSortOrder('asc');
    }
  };

  const sortedReservations = [...reservations]
    .filter(res => {
      let matchesStart = true;
      let matchesEnd = true;
      let matchesStatus = true;
      
      if (resStartDate) {
        matchesStart = new Date(res.dateForSort) >= new Date(resStartDate);
      }
      if (resEndDate) {
        matchesEnd = new Date(res.dateForSort) <= new Date(resEndDate);
      }
      if (resStatusFilter !== 'ALL') {
        matchesStatus = res.status === resStatusFilter;
      }
      
      return matchesStart && matchesEnd && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (resSortField === 'date') {
        comparison = new Date(a.dateForSort).getTime() - new Date(b.dateForSort).getTime();
      } else if (resSortField === 'name') {
        comparison = a.userName.localeCompare(b.userName);
      } else if (resSortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return resSortOrder === 'asc' ? comparison : -comparison;
    });

  const sortedSessions = [...sessions]
    .filter(session => {
      let matchesStart = true;
      let matchesEnd = true;
      let matchesTimeStart = true;
      let matchesTimeEnd = true;
      let matchesStatus = true;
      let matchesPackage = true;

      if (sessionStartDate) {
        matchesStart = new Date(session.sessionDate) >= new Date(sessionStartDate);
      }
      if (sessionEndDate) {
        matchesEnd = new Date(session.sessionDate) <= new Date(sessionEndDate);
      }
      if (sessionStartTime) {
        matchesTimeStart = session.startTime >= sessionStartTime;
      }
      if (sessionEndTime) {
        matchesTimeEnd = session.endTime <= sessionEndTime;
      }
      if (sessionStatusFilter !== 'ALL') {
        matchesStatus = session.status === sessionStatusFilter;
      }
      if (sessionPackageFilter !== 'ALL') {
        matchesPackage = session.packageId === sessionPackageFilter;
      }

      return matchesStart && matchesEnd && matchesTimeStart && matchesTimeEnd && matchesStatus && matchesPackage;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sessionSortField === 'date') {
        comparison = new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime();
      } else if (sessionSortField === 'capacity') {
        comparison = a.maxCapacity - b.maxCapacity;
      } else if (sessionSortField === 'package') {
        const pkgA = packages.find(p => p.id === a.packageId)?.name || '';
        const pkgB = packages.find(p => p.id === b.packageId)?.name || '';
        comparison = pkgA.localeCompare(pkgB);
      } else if (sessionSortField === 'time') {
        comparison = a.startTime.localeCompare(b.startTime);
      }
      return sessionSortOrder === 'asc' ? comparison : -comparison;
    });

  if (loading) return <div className="container py-20 text-center">Loading dashboard...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl serif mb-12">Admin Dashboard</h1>

      <Tabs defaultValue="reservations" className="space-y-8">
        <TabsList className="bg-white p-1 rounded-full border shadow-sm">
          <TabsTrigger value="reservations" className="rounded-full px-8">Reservations</TabsTrigger>
          <TabsTrigger value="packages" className="rounded-full px-8">Packages</TabsTrigger>
          <TabsTrigger value="sessions" className="rounded-full px-8">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="reservations">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl serif">Reservations</h2>
            
            <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-xl shadow-sm border">
              <div className="flex items-center gap-2">
                <Label htmlFor="res-start-date" className="text-xs text-slate-500">From</Label>
                <Input 
                  id="res-start-date" 
                  type="date" 
                  className="h-8 text-sm w-36"
                  value={resStartDate}
                  onChange={(e) => setResStartDate(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="res-end-date" className="text-xs text-slate-500">To</Label>
                <Input 
                  id="res-end-date" 
                  type="date" 
                  className="h-8 text-sm w-36"
                  value={resEndDate}
                  onChange={(e) => setResEndDate(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-slate-500">Status</Label>
                <Select value={resStatusFilter} onValueChange={setResStatusFilter}>
                  <SelectTrigger className="h-8 w-32 text-sm">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">Customer <ArrowUpDown className="h-3 w-3" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('date')}>
                    <div className="flex items-center gap-1">Session <ArrowUpDown className="h-3 w-3" /></div>
                  </TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead className="cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1">Status <ArrowUpDown className="h-3 w-3" /></div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedReservations.map((res) => (
                  <TableRow key={res.id}>
                    <TableCell className="font-medium">{res.userName}</TableCell>
                    <TableCell>{res.sessionInfo}</TableCell>
                    <TableCell>{res.guestCount}</TableCell>
                    <TableCell>
                      <Badge variant={res.status === 'CONFIRMED' ? 'default' : 'outline'} className={res.status === 'CONFIRMED' ? 'bg-green-500' : ''}>
                        {res.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {res.status === 'PENDING' && (
                        <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleConfirmReservation(res.id)}>
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
            <div className="flex gap-2">
              <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}>
                Reset All Data
              </Button>
              <Button className="bg-brand-olive rounded-full" onClick={() => setIsCreatePackageOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> New Package
              </Button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="border-none shadow-md bg-white">
                <CardHeader>
                  <CardTitle className="serif flex justify-between">
                    {pkg.name}
                    <Badge variant={pkg.isActive ? 'default' : 'secondary'}>{pkg.isActive ? 'Active' : 'Hidden'}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pkg.imageUrl && (
                    <div className="w-full h-32 mb-4 rounded-md overflow-hidden bg-slate-100">
                      <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{pkg.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-brand-olive">${pkg.pricePerPerson}/pp</span>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => setEditingPackage(pkg)}><Edit className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-red-500" onClick={() => setDeletePackageId(pkg.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl serif">Dining Sessions</h2>
            
            <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-xl shadow-sm border">
              <div className="flex items-center gap-2">
                <Label htmlFor="start-date" className="text-xs text-slate-500">From</Label>
                <Input 
                  id="start-date" 
                  type="date" 
                  className="h-8 text-sm w-36"
                  value={sessionStartDate}
                  onChange={(e) => setSessionStartDate(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="end-date" className="text-xs text-slate-500">To</Label>
                <Input 
                  id="end-date" 
                  type="date" 
                  className="h-8 text-sm w-36"
                  value={sessionEndDate}
                  onChange={(e) => setSessionEndDate(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-slate-500">Package</Label>
                <Select value={sessionPackageFilter} onValueChange={setSessionPackageFilter}>
                  <SelectTrigger className="h-8 w-40 text-sm">
                    <SelectValue placeholder="All Packages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Packages</SelectItem>
                    {packages.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-slate-500">Status</Label>
                <Select value={sessionStatusFilter} onValueChange={setSessionStatusFilter}>
                  <SelectTrigger className="h-8 w-32 text-sm">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="FULL">Full</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button className="bg-brand-olive rounded-full" onClick={() => setIsCreateSessionOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> New Session
            </Button>
          </div>
          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSessionSort('package')}>
                    <div className="flex items-center gap-1">Package <ArrowUpDown className="h-3 w-3" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSessionSort('date')}>
                    <div className="flex items-center gap-1">Date <ArrowUpDown className="h-3 w-3" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSessionSort('time')}>
                    <div className="flex items-center gap-1">Time <ArrowUpDown className="h-3 w-3" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSessionSort('capacity')}>
                    <div className="flex items-center gap-1">Capacity <ArrowUpDown className="h-3 w-3" /></div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{packages.find(p => p.id === session.packageId)?.name || 'Unknown Package'}</TableCell>
                    <TableCell>{session.sessionDate}</TableCell>
                    <TableCell>{session.startTime} - {session.endTime}</TableCell>
                    <TableCell>{session.currentBooked} / {session.maxCapacity}</TableCell>
                    <TableCell>
                      <SessionStatusBadge status={session.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => setEditingSession(session)}><Edit className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedSessions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No sessions found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Package Dialog */}
      <Dialog open={!!deletePackageId} onOpenChange={(open) => !open && setDeletePackageId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Package</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this package? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button variant="destructive" onClick={confirmDeletePackage}>
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Session Dialog */}
      <Dialog open={isCreateSessionOpen} onOpenChange={setIsCreateSessionOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Session</DialogTitle>
            <DialogDescription>
              Schedule a new dining session for a buffet package.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Package</Label>
              <Select value={newSession.packageId} onValueChange={(v) => setNewSession({...newSession, packageId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent>
                  {packages.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={newSession.sessionDate} onChange={(e) => setNewSession({...newSession, sessionDate: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={newSession.startTime} onChange={(e) => setNewSession({...newSession, startTime: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" value={newSession.endTime} onChange={(e) => setNewSession({...newSession, endTime: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Capacity</Label>
                <Input type="number" min="1" value={newSession.maxCapacity} onChange={(e) => setNewSession({...newSession, maxCapacity: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Initial Status</Label>
                <Select value={newSession.status} onValueChange={(v) => setNewSession({...newSession, status: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="FULL">Full</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button className="bg-brand-olive hover:bg-brand-olive/90 text-white" onClick={handleCreateSession}>Create Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Session Dialog */}
      <Dialog open={!!editingSession} onOpenChange={(open) => !open && setEditingSession(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
            <DialogDescription>
              Modify the details of this dining session.
            </DialogDescription>
          </DialogHeader>
          {editingSession && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Package</Label>
                <Select value={editingSession.packageId} onValueChange={(v) => setEditingSession({...editingSession, packageId: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={editingSession.sessionDate} onChange={(e) => setEditingSession({...editingSession, sessionDate: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input type="time" value={editingSession.startTime} onChange={(e) => setEditingSession({...editingSession, startTime: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input type="time" value={editingSession.endTime} onChange={(e) => setEditingSession({...editingSession, endTime: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Capacity</Label>
                  <Input type="number" min="1" value={editingSession.maxCapacity} onChange={(e) => setEditingSession({...editingSession, maxCapacity: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editingSession.status} onValueChange={(v) => setEditingSession({...editingSession, status: v as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="FULL">Full</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button className="bg-brand-olive hover:bg-brand-olive/90 text-white" onClick={handleUpdateSession}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Package Dialog */}
      <Dialog open={isCreatePackageOpen} onOpenChange={setIsCreatePackageOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Package</DialogTitle>
            <DialogDescription>
              Add a new buffet package to your offerings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Package Name</Label>
              <Input value={newPackage.name} onChange={e => setNewPackage({...newPackage, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={newPackage.description} onChange={e => setNewPackage({...newPackage, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input type="number" min="1" value={newPackage.pricePerPerson} onChange={e => setNewPackage({...newPackage, pricePerPerson: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newPackage.type} onValueChange={v => setNewPackage({...newPackage, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRUNCH">Brunch</SelectItem>
                    <SelectItem value="LUNCH">Lunch</SelectItem>
                    <SelectItem value="DINNER">Dinner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={newPackage.isActive ? 'active' : 'hidden'} onValueChange={v => setNewPackage({...newPackage, isActive: v === 'active'})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Package Image</Label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              {newPackage.imageUrl && (
                <div className="mt-2 w-full h-48 rounded-xl overflow-hidden border">
                  <img src={newPackage.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button className="bg-brand-olive hover:bg-brand-olive/90 text-white" onClick={handleCreatePackage}>
              Create Package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Package Dialog */}
      <Dialog open={!!editingPackage} onOpenChange={(open) => !open && setEditingPackage(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
            <DialogDescription>
              Modify the details of this buffet package.
            </DialogDescription>
          </DialogHeader>
          {editingPackage && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Package Name</Label>
                <Input value={editingPackage.name} onChange={e => setEditingPackage({...editingPackage, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={editingPackage.description} onChange={e => setEditingPackage({...editingPackage, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input type="number" min="1" value={editingPackage.pricePerPerson} onChange={e => setEditingPackage({...editingPackage, pricePerPerson: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={editingPackage.type} onValueChange={v => setEditingPackage({...editingPackage, type: v as any})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRUNCH">Brunch</SelectItem>
                      <SelectItem value="LUNCH">Lunch</SelectItem>
                      <SelectItem value="DINNER">Dinner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editingPackage.isActive ? 'active' : 'hidden'} onValueChange={v => setEditingPackage({...editingPackage, isActive: v === 'active'})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Package Image</Label>
                <Input type="file" accept="image/*" onChange={handleEditImageUpload} />
                {editingPackage.imageUrl && (
                  <div className="mt-2 w-full h-48 rounded-xl overflow-hidden border">
                    <img src={editingPackage.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button className="bg-brand-olive hover:bg-brand-olive/90 text-white" onClick={handleUpdatePackage}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SessionStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'OPEN': 
      return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100" variant="outline">OPEN</Badge>;
    case 'FULL': 
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100" variant="outline">FULL</Badge>;
    case 'CANCELLED': 
      return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100" variant="outline">CANCELLED</Badge>;
    default: 
      return <Badge variant="secondary">{status}</Badge>;
  }
}
