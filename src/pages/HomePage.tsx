import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { motion } from 'motion/react';
import { ArrowRight, Star, Clock, Users } from 'lucide-react';

export function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2070" 
            alt="Buffet Spread" 
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-cream/0 via-brand-cream/50 to-brand-cream" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-7xl md:text-9xl serif leading-tight mb-8">
              A Symphony <br />
              <span className="italic text-brand-olive">of Flavors</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-10 leading-relaxed max-w-xl">
              Experience the art of buffet dining. From ocean-fresh seafood to artisanal desserts, we curate moments that linger on the palate.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/packages">
                <Button size="lg" className="bg-brand-olive hover:bg-brand-olive/90 text-white rounded-full px-8 h-14 text-lg">
                  Explore Packages <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg border-brand-olive text-brand-olive hover:bg-brand-olive/5">
                  Join the Club
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<Star className="h-8 w-8 text-brand-olive" />}
              title="Premium Selection"
              description="Only the finest ingredients sourced daily from local markets and global suppliers."
            />
            <FeatureCard 
              icon={<Clock className="h-8 w-8 text-brand-olive" />}
              title="Flexible Sessions"
              description="Choose from lunch, brunch, or dinner sessions that fit your schedule perfectly."
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-brand-olive" />}
              title="Group Friendly"
              description="Spacious seating and tailored packages for family gatherings or corporate events."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-brand-olive text-white overflow-hidden relative">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl serif mb-8">Ready for a Feast?</h2>
          <p className="text-xl opacity-80 max-w-2xl mx-auto mb-12">
            Reserve your table in seconds and prepare for an unforgettable culinary journey.
          </p>
          <Link to="/packages">
            <Button size="lg" className="bg-white text-brand-olive hover:bg-brand-cream rounded-full px-12 h-16 text-xl font-semibold">
              Book Your Table Now
            </Button>
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48 blur-3xl" />
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="p-8 rounded-3xl bg-brand-cream/30 border border-brand-cream hover:shadow-xl transition-all"
    >
      <div className="mb-6">{icon}</div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}
