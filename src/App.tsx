import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Navbar } from './components/Navbar';
import { Toaster } from './components/ui/sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';

// Real Pages
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { PackagesPage } from './pages/PackagesPage';
import { BookingPage } from './pages/BookingPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AboutPage } from './pages/AboutPage';

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, profile, loading, isAdmin } = useAuth();
  
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-brand-cream">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-olive"></div>
  </div>;
  if (!user) return <Navigate to="/auth" />;
  if (adminOnly && !isAdmin) return <Navigate to="/" />;
  
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
                <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
                <Route path="/auth" element={<PageWrapper><AuthPage /></PageWrapper>} />
                <Route path="/packages" element={<PageWrapper><PackagesPage /></PageWrapper>} />
                <Route 
                  path="/book/:packageId" 
                  element={
                    <ProtectedRoute>
                      <PageWrapper><BookingPage /></PageWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/my-bookings" 
                  element={
                    <ProtectedRoute>
                      <PageWrapper><MyBookingsPage /></PageWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/*" 
                  element={
                    <ProtectedRoute adminOnly>
                      <PageWrapper><AdminDashboard /></PageWrapper>
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </AnimatePresence>
          </main>
          <Toaster position="top-center" />
        </div>
      </Router>
    </AuthProvider>
  );
}

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

