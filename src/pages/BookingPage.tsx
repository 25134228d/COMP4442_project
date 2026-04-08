import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BuffetService } from '../lib/services';
import { BuffetPackage, DiningSession } from '../types';
import { useAuth } from '../lib/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar } from '../components/ui/calendar';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Users, Calendar as CalendarIcon, Clock, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export function BookingPage() {
  const { packageId } = useParams<{ packageId: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [pkg, setPkg] = useState<BuffetPackage | null>(null);
  const [sessions, setSessions] = useState<DiningSession[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSession, setSelectedSession] = useState<DiningSession | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [specialRequest, setSpecialRequest] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!packageId) return;
      
      const pkgDoc = await getDoc(doc(db, 'packages', packageId));
      if (pkgDoc.exists()) {
        setPkg({ id: pkgDoc.id, ...pkgDoc.data() } as BuffetPackage);
      }
      
      const sessionData = await BuffetService.getSessionsByPackage(packageId);
      if (sessionData) setSessions(sessionData);
      
      setLoading(false);
    };
    fetchData();
  }, [packageId]);

  const availableSessions = sessions.filter(s => {
    if (!selectedDate) return false;
    return s.sessionDate === format(selectedDate, 'yyyy-MM-dd') && s.status === 'OPEN';
  });

  const handleBooking = async () => {
    if (!user || !selectedSession || !pkg) return;
    
    setSubmitting(true);
    try {
      // 1. Create Reservation
      const reservationData = {
        userId: user.uid,
        sessionId: selectedSession.id,
        guestCount,
        specialRequest,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await addDoc(collection(db, 'reservations'), reservationData);
      
      // 2. Update Session Capacity
      const sessionRef = doc(db, 'sessions', selectedSession.id);
      await updateDoc(sessionRef, {
        currentBooked: increment(guestCount)
      });
      
      // Check if session is now full
      const updatedSessionSnap = await getDoc(sessionRef);
      const updatedSession = updatedSessionSnap.data() as DiningSession;
      if (updatedSession.currentBooked >= updatedSession.maxCapacity) {
        await updateDoc(sessionRef, { status: 'FULL' });
      }

      setStep(4);
      toast.success('Reservation successful!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'reservations');
      toast.error('Failed to book. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container py-20 text-center">Loading package details...</div>;
  if (!pkg) return <div className="container py-20 text-center">Package not found.</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-4xl serif mb-2">Reserve Your Table</h1>
          <p className="text-slate-500 font-medium">{pkg.name} • ${pkg.pricePerPerson} per person</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`h-2 w-8 rounded-full transition-all ${step >= i ? 'bg-brand-olive' : 'bg-slate-200'}`} 
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid md:grid-cols-2 gap-8"
          >
            <Card className="border-none shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 serif">
                  <CalendarIcon className="h-5 w-5 text-brand-olive" /> Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  disabled={(date) => date < new Date()}
                />
              </CardContent>
            </Card>

            <div className="space-y-6">
              <h3 className="text-xl font-bold serif flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand-olive" /> Available Sessions
              </h3>
              {availableSessions.length > 0 ? (
                <div className="grid gap-3">
                  {availableSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        selectedSession?.id === session.id 
                          ? 'border-brand-olive bg-brand-olive/5 ring-1 ring-brand-olive' 
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-lg">{session.startTime} - {session.endTime}</span>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-tighter">
                          {session.maxCapacity - session.currentBooked} seats left
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                        {pkg.type} SESSION
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-500">No sessions available for this date.</p>
                </div>
              )}
              
              <Button 
                className="w-full bg-brand-olive h-12 rounded-full" 
                disabled={!selectedSession}
                onClick={() => setStep(2)}
              >
                Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-xl mx-auto space-y-8"
          >
            <Card className="border-none shadow-xl bg-white p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">Number of Guests</Label>
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      className="h-12 w-12 rounded-full"
                      onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    >
                      -
                    </Button>
                    <span className="text-3xl font-bold w-12 text-center">{guestCount}</span>
                    <Button 
                      variant="outline" 
                      className="h-12 w-12 rounded-full"
                      onClick={() => setGuestCount(Math.min(selectedSession!.maxCapacity - selectedSession!.currentBooked, guestCount + 1))}
                    >
                      +
                    </Button>
                    <Users className="h-6 w-6 text-slate-300 ml-auto" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">Special Requests</Label>
                  <Input 
                    placeholder="Dietary requirements, allergies, etc." 
                    className="h-12 rounded-xl"
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                  />
                </div>
              </div>
            </Card>

            <div className="flex gap-4">
              <Button variant="ghost" className="flex-1 h-12 rounded-full" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button className="flex-[2] bg-brand-olive h-12 rounded-full" onClick={() => setStep(3)}>
                Review Booking <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-xl mx-auto space-y-8"
          >
            <Card className="border-none shadow-xl bg-white overflow-hidden">
              <div className="bg-brand-olive p-6 text-white">
                <h3 className="text-2xl serif">Booking Summary</h3>
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-y-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Package</p>
                    <p className="font-bold">{pkg.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date</p>
                    <p className="font-bold">{selectedDate ? format(selectedDate, 'PPP') : ''}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Time</p>
                    <p className="font-bold">{selectedSession?.startTime} - {selectedSession?.endTime}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Guests</p>
                    <p className="font-bold">{guestCount} {guestCount === 1 ? 'Person' : 'People'}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-lg font-bold serif">Estimated Total</span>
                  <span className="text-3xl font-bold text-brand-olive">${pkg.pricePerPerson * guestCount}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="ghost" className="flex-1 h-12 rounded-full" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button 
                className="flex-[2] bg-brand-olive h-12 rounded-full" 
                onClick={handleBooking}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : 'Confirm Reservation'}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center space-y-8 py-12"
          >
            <div className="flex justify-center">
              <div className="bg-green-100 p-6 rounded-full">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl serif">Reservation Confirmed!</h2>
              <p className="text-slate-500">
                Thank you for choosing BuffetEase. We've sent a confirmation email to your inbox.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button className="bg-brand-olive h-12 rounded-full" onClick={() => navigate('/my-bookings')}>
                View My Bookings
              </Button>
              <Button variant="ghost" className="h-12 rounded-full" onClick={() => navigate('/')}>
                Return to Home
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
