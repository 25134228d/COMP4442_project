import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { auth } from '../lib/firebase';
import { Button } from './ui/button';
import { Utensils, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, profile, isAdmin } = useAuth();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Auto-hide navbar on scroll down, reveal on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 50);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { to: '/packages', label: 'Packages', show: true },
    { to: '/my-bookings', label: 'My Bookings', show: !!user },
    { to: '/admin', label: 'Dashboard', show: !!isAdmin, icon: <LayoutDashboard className="h-4 w-4" /> },
  ];

  return (
    <>
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 w-full border-b bg-brand-cream/80 backdrop-blur-md
          transition-transform duration-300 ease-in-out
          ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <Utensils className="h-5 w-5 sm:h-6 sm:w-6 text-brand-olive" />
              <span className="text-base sm:text-lg font-bold serif tracking-tight">BuffetEase</span>
            </Link>

            {/* Desktop Navigation Links — center */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8 flex-1 justify-center">
              {navLinks.filter(l => l.show).map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors whitespace-nowrap
                    ${location.pathname === link.to
                      ? 'text-brand-olive'
                      : 'text-foreground hover:text-brand-olive'
                    }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop User Menu — right */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              {user ? (
                <div className="flex items-center gap-3">
                  {/* User Avatar & Info */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-olive/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-brand-olive uppercase">
                        {profile?.name?.charAt(0) ?? user.email?.charAt(0)}
                      </span>
                    </div>
                    <div className="hidden lg:flex flex-col items-start leading-tight">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {profile?.role}
                      </span>
                      <span className="text-sm font-medium max-w-[140px] truncate">
                        {profile?.name ?? user.email}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => auth.signOut()}
                    title="Sign Out"
                    className="h-9 w-9 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button className="bg-brand-olive hover:bg-brand-olive/90 text-white rounded-full px-5 h-9 text-sm">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Right Controls */}
            <div className="md:hidden flex items-center gap-1">
              {user && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => auth.signOut()}
                  title="Sign Out"
                  className="h-9 w-9 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(prev => !prev)}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
                className="h-9 w-9 relative"
              >
                {/* Animated hamburger/close icon */}
                <span className={`absolute inset-0 flex items-center justify-center transition-all duration-200
                  ${isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}>
                  <X className="h-5 w-5" />
                </span>
                <span className={`absolute inset-0 flex items-center justify-center transition-all duration-200
                  ${isMobileMenuOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`}>
                  <Menu className="h-5 w-5" />
                </span>
              </Button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu with slide animation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t
            ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="bg-brand-cream/98 backdrop-blur-sm px-4 pt-3 pb-6 space-y-1">

            {/* Nav Links */}
            {navLinks.filter(l => l.show).map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2.5 px-3 py-3 rounded-lg text-sm font-medium
                  transition-colors active:scale-[0.98]
                  ${location.pathname === link.to
                    ? 'text-brand-olive bg-brand-olive/10'
                    : 'text-foreground hover:text-brand-olive hover:bg-brand-olive/8'
                  }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            {/* Divider + User Info or Sign In */}
            <div className="pt-3 mt-3 border-t border-slate-200">
              {user ? (
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-9 h-9 rounded-full bg-brand-olive/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-brand-olive uppercase">
                      {profile?.name?.charAt(0) ?? user.email?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex flex-col leading-tight min-w-0">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {profile?.role}
                    </span>
                    <span className="text-sm font-medium truncate">
                      {profile?.name ?? user.email}
                    </span>
                  </div>
                </div>
              ) : (
                <Link to="/auth" className="block">
                  <Button className="w-full bg-brand-olive hover:bg-brand-olive/90 text-white rounded-full mt-1">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding under the fixed navbar */}
      <div className="h-16" />

      {/* Background overlay when mobile menu is open */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}