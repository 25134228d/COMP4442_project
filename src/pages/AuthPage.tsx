import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AuthPage() {
  return (
    <div className="w-full flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 mx-auto">
      <Card className="w-full max-w-md border-none shadow-2xl bg-white/50 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-brand-olive w-12 h-12 rounded-full flex items-center justify-center">
            <Utensils className="text-white h-6 w-6" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl serif">Direct Booking Enabled</CardTitle>
            <CardDescription className="text-slate-500">
              You no longer need a mock sign-in page. Please choose a package and complete booking details directly.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link to="/packages" className="block">
            <Button className="w-full h-12 text-base font-medium bg-brand-olive hover:bg-brand-olive/90 text-white transition-all">
              Browse Packages
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
