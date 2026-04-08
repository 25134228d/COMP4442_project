import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, orderBy, getDoc } from 'firebase/firestore';
import { BuffetPackage, DiningSession, Reservation, UserProfile } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';

export function AdminDashboard() {
  const [packages, setPackages] = useState<BuffetPackage[]>([]);
  const [sessions, setSessions] = useState<DiningSession[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const pkgSnap = await getDocs(collection(db, 'packages'));
      setPackages(pkgSnap.docs.map(d => ({ id: d.id, ...d.data() } as BuffetPackage)));

      const sessionSnap = await getDocs(collection(db, 'sessions'));
      setSessions(sessionSnap.docs.map(d => ({ id: d.id, ...d.data() } as DiningSession)));

      const resSnap = await getDocs(query(collection(db, 'reservations'), orderBy('createdAt', 'desc')));
      const resData = await Promise.all(resSnap.docs.map(async (d) => {
        const data = d.data();
        const userSnap = await getDoc(doc(db, 'users', data.userId));
        const sessionSnap = await getDoc(doc(db, 'sessions', data.sessionId));
        return { 
          id: d.id, 
          ...data, 
          userName: userSnap.data()?.name || 'Unknown',
          sessionInfo: sessionSnap.data() ? `${sessionSnap.data().sessionDate} ${sessionSnap.data().startTime}` : 'N/A'
        };
      }));
      setReservations(resData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleConfirmReservation = async (id: string) => {
    await updateDoc(doc(db, 'reservations', id), { status: 'CONFIRMED' });
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'CONFIRMED' } : r));
    toast.success('Reservation confirmed');
  };

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
           <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl serif">Dining Sessions</h2>
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
                {sessions.map((session) => (
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
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper to fetch doc (needed for enriched reservations)
