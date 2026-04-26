import React, { useEffect, useState } from 'react';
import { BuffetService, GuestReservationSession } from '../lib/services';
import { Reservation, BuffetPackage, DiningSession } from '../types';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';

interface BookingWithDetails extends Reservation {
  pkg?: BuffetPackage;
  session?: DiningSession;
}

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const guestReservationId = GuestReservationSession.getGuestId();
      if (!guestReservationId) {
        setLoading(false);
        return;
      }

      const data = await BuffetService.getMyReservations(guestReservationId);
      if (data) {
        const allSessions = await BuffetService.getAllSessions();
        const enriched = await Promise.all(data.map(async (b) => {
          const session = allSessions.find(s => s.id === b.sessionId);
          const pkg = session ? await BuffetService.getPackageById(session.packageId) : undefined;

          return { ...b, session, pkg };
        }));
        setBookings(enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
      setLoading(false);
    };

    fetchBookings();
  }, []);

  if (loading) return <div className="container py-20 text-center">Loading your bookings...</div>;

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="mb-12">
        <h1 className="text-5xl serif mb-4">My Reservations</h1>
        <p className="text-slate-500">Manage your upcoming dining experiences and history.</p>
      </div>

      <div className="space-y-6">
        {bookings.map((booking, index) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="border-none shadow-md hover:shadow-xl transition-all overflow-hidden bg-white">
              <CardContent className="p-0 flex flex-col md:flex-row">
                <div className="w-full md:w-48 h-32 md:h-auto bg-slate-100">
                  <img
                    src={booking.pkg?.imageUrl || `https://picsum.photos/seed/${booking.pkg?.name}/400/300`}
                    alt={booking.pkg?.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-grow p-6 flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold serif">{booking.pkg?.name}</h3>
                        <StatusBadge status={booking.status} />
                      </div>
                      <p className="text-sm text-slate-500 uppercase tracking-widest font-semibold">{booking.pkg?.type}</p>
                    </div>

                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="h-4 w-4 text-brand-olive" />
                        {booking.session ? format(new Date(booking.session.sessionDate), 'PPP') : 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="h-4 w-4 text-brand-olive" />
                        {booking.session?.startTime} - {booking.session?.endTime}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users className="h-4 w-4 text-brand-olive" />
                        {booking.guestCount} {booking.guestCount === 1 ? 'Guest' : 'Guests'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
                      <p className="text-2xl font-bold text-brand-olive">${(booking.pkg?.pricePerPerson || 0) * booking.guestCount}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {bookings.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-500 mb-2">No temporary reservations found.</p>
            <p className="text-slate-400 mb-6 text-sm">Your reservations are only stored for this browser session.</p>
            <Link to="/packages">
              <Button className="bg-brand-olive rounded-full px-8">Browse Packages</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    CONFIRMED: "bg-green-100 text-green-700 border-green-200",
    CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <Badge variant="outline" className={`${styles[status as keyof typeof styles]} border px-2 py-0 text-[10px] font-bold uppercase tracking-wider`}>
      {status}
    </Badge>
  );
}
