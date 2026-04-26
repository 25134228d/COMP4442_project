import React, { useEffect, useState } from 'react';
import { BuffetService } from '../lib/services';
import { BuffetPackage } from '../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Utensils, Info } from 'lucide-react';

export function PackagesPage() {
  const [packages, setPackages] = useState<BuffetPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      let data = await BuffetService.getActivePackages();

      // A nice fallback package for demo purposes
      if (!data || data.length === 0) {
        data = [{
          id: 'lunch-demo-001',
          name: 'Elegant Lunch Buffet',
          description: 'Chosen lunch buffet includes fresh salads, seafood, stir-fries, and exquisite desserts, making it suitable for business gatherings or family lunches.',
          pricePerPerson: 388,
          isActive: true,
          imageUrl: 'https://picsum.photos/seed/lunch-buffet/800/600',
          type: 'LUNCH'
        }];
      }

      if (data) setPackages(data);
      setLoading(false);
    };
    fetchPackages();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-olive"></div>
        <p className="mt-4 text-slate-500 font-medium">Discovering flavors...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mb-16">
        <h1 className="text-5xl md:text-7xl serif mb-6">Our Packages</h1>
        <p className="text-xl text-slate-600">
          From casual brunches to grand evening feasts, find the perfect dining experience for your occasion.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all h-full flex flex-col bg-white">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={pkg.imageUrl || `https://picsum.photos/seed/${pkg.name}/800/600`}
                  alt={pkg.name}
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/90 text-brand-olive hover:bg-white backdrop-blur-sm border-none px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    {pkg.type}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl serif">{pkg.name}</CardTitle>
                <CardDescription className="line-clamp-2 text-slate-500">
                  {pkg.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-brand-olive">${pkg.pricePerPerson}</span>
                  <span className="text-sm text-slate-400">/ person</span>
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-8 px-6">
                <Link to={`/book/${pkg.id}`} className="w-full">
                  <Button className="w-full bg-brand-olive hover:bg-brand-olive/90 text-white rounded-full h-12">
                    Book Now
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}