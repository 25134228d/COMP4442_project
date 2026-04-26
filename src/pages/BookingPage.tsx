import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BuffetService, GuestReservationSession } from '../lib/services';
import { BuffetPackage, DiningSession } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Users, Calendar as CalendarIcon, Clock } from 'lucide-react';

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const HK_PHONE_PREFIX = '852-';

const minutesToTime = (minutes: number) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

const buildRandomSessions = (packageId: string, type: string): Omit<DiningSession, 'id'>[] => {
  const sessions: Omit<DiningSession, 'id'>[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const config = {
    BRUNCH: { startMin: 540, startMax: 630, durationMin: 105, durationMax: 150 },
    LUNCH: { startMin: 660, startMax: 780, durationMin: 90, durationMax: 135 },
    DINNER: { startMin: 1050, startMax: 1170, durationMin: 120, durationMax: 180 },
  }[type] || { startMin: 720, startMax: 840, durationMin: 105, durationMax: 150 };

  for (let dayOffset = 1; dayOffset <= 5; dayOffset++) {
    const sessionDate = new Date(today);
    sessionDate.setDate(today.getDate() + dayOffset);
    const dateStr = sessionDate.toISOString().split('T')[0];

    for (let i = 0; i < 2; i++) {
      const start = randomInt(config.startMin, config.startMax);
      const roundedStart = Math.round(start / 15) * 15;
      const duration = Math.round(randomInt(config.durationMin, config.durationMax) / 15) * 15;
      const end = Math.min(roundedStart + duration, 1380);
      const maxCapacity = randomInt(45, 120);
      const currentBooked = randomInt(0, Math.floor(maxCapacity * 0.4));

      sessions.push({
        packageId,
        sessionDate: dateStr,
        startTime: minutesToTime(roundedStart),
        endTime: minutesToTime(end),
        maxCapacity,
        currentBooked,
        status: 'OPEN',
      });
    }
  }

  return sessions;
};

export function BookingPage() {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();

  const [pkg, setPkg] = useState<BuffetPackage | null>(null);
  const [sessions, setSessions] = useState<DiningSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<DiningSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState(HK_PHONE_PREFIX);
  const [guestCount, setGuestCount] = useState(2);
  const [specialRequest, setSpecialRequest] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!packageId) return;
      try {
        const [pkgData, sessionData] = await Promise.all([
          BuffetService.getPackageById(packageId),
          BuffetService.getSessionsByPackage(packageId),
        ]);

        setPkg(pkgData);

        if (!sessionData || sessionData.length === 0) {
          const generated = buildRandomSessions(packageId, pkgData.type);
          const created = await Promise.all(generated.map((s) => BuffetService.createSession(s)));
          setSessions(created);
        } else {
          setSessions(sessionData);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load booking data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [packageId]);

  const openSessions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return sessions
      .filter((s) => s.status === 'OPEN' && new Date(s.sessionDate) >= today)
      .sort((a, b) => {
        const dateDiff = new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime();
        if (dateDiff !== 0) return dateDiff;
        return a.startTime.localeCompare(b.startTime);
      });
  }, [sessions]);

  const sessionsByDate = useMemo(
    () =>
      openSessions.reduce((acc, session) => {
        if (!acc[session.sessionDate]) {
          acc[session.sessionDate] = [];
        }
        acc[session.sessionDate].push(session);
        return acc;
      }, {} as Record<string, DiningSession[]>),
    [openSessions],
  );

  const sortedDates = useMemo(
    () => Object.keys(sessionsByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()),
    [sessionsByDate],
  );

  const remainingSeats = selectedSession
    ? selectedSession.maxCapacity - selectedSession.currentBooked
    : 0;

  // Regular Expression for name: only allow English letters and spaces
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/^[a-zA-Z\s]*$/.test(value)) {
      toast.error('Full Name can only contain English letters and spaces. Example: Chan Tai Man');
      return;
    }
    setContactName(value);
  };

  // Regular Expression for email: only allow valid email characters (letters, numbers, @, ., _, -)
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/^[a-zA-Z0-9@._%+-]*$/.test(value)) {
      toast.error('Email can only contain letters, numbers, and @ . _ % + -');
      return;
    }
    setContactEmail(value);
  };

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (!value) return;
    if (!value.includes('@')) {
      toast.error('Email must include "@". Example: you@example.com');
    }
  };

  // Phone number must stay as 852- + exactly 8 digits (Hong Kong format)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!value.startsWith(HK_PHONE_PREFIX)) {
      toast.error('Phone number must start with 852- and cannot remove the prefix.');
      setContactPhone(HK_PHONE_PREFIX);
      return;
    }

    const digitsPart = value.slice(HK_PHONE_PREFIX.length);
    if (!/^\d*$/.test(digitsPart)) {
      toast.error('Phone number can only contain 8 digits after 852-.');
      return;
    }

    if (digitsPart.length > 8) {
      toast.error('Phone number can only contain 8 digits after 852-.');
      return;
    }

    setContactPhone(value);
  };

  const handleBooking = async () => {
    if (!selectedSession || !pkg) return;

    if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      toast.error('Please fill in your personal details.');
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(contactName.trim())) {
      toast.error('Name can only contain English letters and spaces.');
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(contactEmail.trim())) {
      toast.error('Please enter a valid email address with "@".');
      return;
    }

    if (!/^852-\d{8}$/.test(contactPhone.trim())) {
      toast.error('Phone number must be a Hong Kong number: 852- followed by 8 digits.');
      return;
    }

    if (guestCount < 1 || guestCount > remainingSeats) {
      toast.error(`Guest count must be between 1 and ${remainingSeats}.`);
      return;
    }

    setSubmitting(true);
    try {
      const guestReservationId = GuestReservationSession.getOrCreateGuestId();
      const requestDetails = [
        `Contact Name: ${contactName.trim()}`,
        `Contact Phone: ${contactPhone.trim()}`,
        specialRequest.trim() ? `Notes: ${specialRequest.trim()}` : null,
      ]
        .filter(Boolean)
        .join(' | ');

      await BuffetService.createReservation({
        userId: guestReservationId,
        sessionId: selectedSession.id,
        guestCount,
        specialRequest: requestDetails,
        status: 'PENDING',
        updatedAt: new Date().toISOString(),
      });

      toast.success('Reservation successful!');
      navigate('/my-bookings');
    } catch (error) {
      console.error(error);
      toast.error('Failed to book. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container py-20 text-center">Loading package details...</div>;
  if (!pkg) return <div className="container py-20 text-center">Package not found.</div>;

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-brand-olive/10 to-brand-cream p-8 border shadow-sm">
        <h1 className="text-5xl p-10 serif mb-2">Reserve Your Table</h1>
        <p className="text-slate-600 font-medium">{pkg.name} • ${pkg.pricePerPerson} per person</p>
      </div>

      <Card className="border-none shadow-xl bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 serif text-2xl">
            <CalendarIcon className="h-7 w-6 text-3xl text-brand-olive" /> Select a Timeslot
          </CardTitle>
          <p className="text-slate-500 mt-1">Pick your preferred session. A quick booking form will expand below.</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {sortedDates.length > 0 ? (
            <div className="space-y-6">
              {sortedDates.map((date) => (
                <div key={date}>
                  <h3 className="text-xl font-bold serif mb-3 text-slate-800">
                    {format(new Date(date), 'EEEE, MMMM do, yyyy')}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {sessionsByDate[date].map((session) => {
                      const seatsLeft = session.maxCapacity - session.currentBooked;
                      return (
                        <button
                          key={session.id}
                          onClick={() => {
                            setSelectedSession(session);
                            setGuestCount((prev) => Math.min(Math.max(prev, 1), seatsLeft || 1));
                          }}
                          className={`p-6 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${selectedSession?.id === session.id
                            ? 'border-brand-olive bg-brand-olive/5 ring-1 ring-brand-olive'
                            : 'border-slate-100 hover:border-slate-300 bg-white'
                            }`}
                        >
                          <div className="flex justify-between items-start w-full mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-brand-olive" />
                              <span className="font-bold">{session.startTime} - {session.endTime}</span>
                            </div>
                            <Badge variant="outline" className="text-[10px] uppercase tracking-tighter bg-white">
                              {seatsLeft} seats left
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-2">
                            {pkg.type} SESSION
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border rounded-2xl border-dashed">
              <p className="text-slate-500">No sessions available for this package.</p>
            </div>
          )}

          <AnimatePresence>
            {selectedSession && (
              <motion.div
                initial={{ opacity: 0, y: 16, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 8, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="border-brand-olive/30 bg-brand-olive/[0.03] shadow-md">
                  <CardHeader>
                    <CardTitle className="text-2xl serif">Your Details</CardTitle>
                    <p className="text-sm text-slate-500">
                      {format(new Date(selectedSession.sessionDate), 'PPP')} • {selectedSession.startTime} - {selectedSession.endTime}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name">Full Name</Label>
                        <Input
                          id="contact-name"
                          className="h-14 text-lg"
                          value={contactName}
                          onChange={handleNameChange}
                          placeholder="e.g. Chan Tai Man (English letters only)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email">Email</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          className="h-14 text-lg"
                          value={contactEmail}
                          onChange={handleEmailChange}
                          onBlur={handleEmailBlur}
                          placeholder="e.g. alex.chan@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-phone">Phone Number (Hong Kong Number)</Label>
                        <Input
                          id="contact-phone"
                          className="h-14 text-lg"
                          value={contactPhone}
                          onChange={handlePhoneChange}
                          placeholder="e.g. 852-91234567"
                          maxLength={12}
                          inputMode="numeric"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="guest-count" className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-brand-olive" /> Number of Guests
                        </Label>
                        <Input
                          id="guest-count"
                          type="number"
                          min={1}
                          max={remainingSeats}
                          className="h-14 text-lg"
                          value={guestCount}
                          onChange={(e) => setGuestCount(Number(e.target.value))}
                        />
                        <p className="text-xs text-slate-500">Available: {remainingSeats} seats</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="special-request">Special Requests (Optional)</Label>
                      <Input
                        id="special-request"
                        className="h-14 text-lg"
                        value={specialRequest}
                        onChange={(e) => setSpecialRequest(e.target.value)}
                        placeholder="Dietary requirements, allergies, birthday setup..."
                      />
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="ttext-4xl font-bold text-slate-400 uppercase tracking-widest">Estimated Total</p>
                        <p className="text-3xl font-bold text-brand-olive">${pkg.pricePerPerson * guestCount}</p>
                      </div>
                      <Button
                        className="bg-brand-olive h-14 text-lg rounded-full px-10"
                        onClick={handleBooking}
                        disabled={submitting}
                      >
                        {submitting ? 'Processing...' : 'Confirm Reservation'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}