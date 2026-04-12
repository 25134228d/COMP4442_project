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
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Check, X, ArrowUpDown } from 'lucide-react';

export function AdminDashboard() {
  const [packages, setPackages] = useState<BuffetPackage[]>([]);
  const [sessions, setSessions] = useState<DiningSession[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sorting state for reservations
  const [resSortField, setResSortField] = useState<'date' | 'name' | 'status'>('date');
  const [resSortOrder, setResSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtering state for sessions
  const [sessionStartDate, setSessionStartDate] = useState('');
  const [sessionEndDate, setSessionEndDate] = useState('');
  const [sessionStatusFilter, setSessionStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      const pkgs = await BuffetService.getActivePackages();
      setPackages(pkgs || []);

      // Mock getting all sessions
      const allSessions: DiningSession[] = [];
      for (const pkg of pkgs || []) {
        const s = await BuffetService.getSessionsByPackage(pkg.id);
        if (s) allSessions.push(...s);
      }
      setSessions(allSessions);

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

  const sortedReservations = [...reservations].sort((a, b) => {
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

  const filteredSessions = sessions.filter(session => {
    let matchesStart = true;
    let matchesEnd = true;
    let matchesStatus = true;

    if (sessionStartDate) {
      matchesStart = new Date(session.sessionDate) >= new Date(sessionStartDate);
    }
    if (sessionEndDate) {
      matchesEnd = new Date(session.sessionDate) <= new Date(sessionEndDate);
    }
    if (sessionStatusFilter !== 'ALL') {
      matchesStatus = session.status === sessionStatusFilter;
    }

    return matchesStart && matchesEnd && matchesStatus;
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
            <Button className="bg-brand-olive rounded-full">
              <Plus className="h-4 w-4 mr-2" /> New Package
            </Button>
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
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{pkg.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-brand-olive">${pkg.pricePerPerson}/pp</span>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost"><Edit className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
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

            <Button className="bg-brand-olive rounded-full">
              <Plus className="h-4 w-4 mr-2" /> New Session
            </Button>
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
                {filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>{session.sessionDate}</TableCell>
                    <TableCell>{session.startTime} - {session.endTime}</TableCell>
                    <TableCell>{session.currentBooked} / {session.maxCapacity}</TableCell>
                    <TableCell>
                      <Badge variant={session.status === 'OPEN' ? 'outline' : 'secondary'}>
                        {session.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost"><Edit className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSessions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      No sessions found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
