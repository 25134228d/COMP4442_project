import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Button } from './ui/button';
import { Utensils, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-brand-cream/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Utensils className="h-6 w-6 text-brand-olive" />
          <span className="text-xl font-bold serif tracking-tight">BuffetEase</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/about" className="text-sm font-medium hover:text-brand-olive transition-colors">
            About Us
          </Link>
          <Link to="/packages" className="text-sm font-medium hover:text-brand-olive transition-colors">
            Packages
          </Link>
          {user && (
            <Link to="/my-bookings" className="text-sm font-medium hover:text-brand-olive transition-colors">
              My Bookings
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{profile?.role || 'CUSTOMER'}</span>
                <span className="text-sm font-medium">{profile?.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Link to="/packages">
              <Button className="bg-brand-olive hover:bg-brand-olive/90 text-white rounded-full px-6 shadow-sm">
                Start Booking
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
