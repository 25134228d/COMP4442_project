import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { MapPin, Phone, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="mb-12 text-center">
        <h1 className="text-5xl md:text-6xl serif mb-6">About BuffetEase</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Discover the story behind our culinary excellence and experience the magic of our dining moments.
        </p>
      </div>

      <Tabs defaultValue="story" className="space-y-8">
        <TabsList className="bg-white p-1 rounded-full border shadow-sm flex justify-center max-w-fit mx-auto">
          <TabsTrigger value="story" className="rounded-full px-8">Our Story</TabsTrigger>
          <TabsTrigger value="team" className="rounded-full px-8">Our Team</TabsTrigger>
          <TabsTrigger value="contact" className="rounded-full px-8">Contact Us</TabsTrigger>
        </TabsList>

        <TabsContent value="story">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-6">
              <h2 className="text-3xl serif font-bold">A Journey of Flavors</h2>
              <p className="text-slate-600 leading-relaxed">
                Founded in 2015, BuffetEase started with a simple vision: to bring world-class culinary experiences to a single, accessible dining room. We believe that a buffet shouldn't just be about quantity, but an exploration of global cuisines crafted with the finest ingredients.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Over the years, we've partnered with local farmers and international spice merchants to ensure every dish tells a story. From our artisanal Sunday brunches to our premium seafood nights, every service is a celebration of food.
              </p>
              <div className="flex gap-6 pt-4">
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-bold text-brand-olive">50+</span>
                  <span className="text-sm text-slate-500 uppercase tracking-wider">Daily Dishes</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-bold text-brand-olive">10k+</span>
                  <span className="text-sm text-slate-500 uppercase tracking-wider">Happy Guests</span>
                </div>
              </div>
            </div>
            <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1000" 
                alt="Restaurant interior" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="team">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl serif font-bold mb-4">Meet Our Master Chefs</h2>
              <p className="text-slate-600">
                Our kitchen is led by award-winning culinary experts who bring decades of international experience to your plate.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: 'Chef Marcus Lin', role: 'Executive Chef', img: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=500' },
                { name: 'Chef Sarah Jenkins', role: 'Head Pastry Chef', img: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&q=80&w=500' },
                { name: 'Chef Kenji Sato', role: 'Sushi Master', img: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=500' }
              ].map((chef, i) => (
                <Card key={i} className="border-none shadow-lg overflow-hidden bg-white">
                  <div className="h-64 overflow-hidden">
                    <img src={chef.img} alt={chef.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold serif mb-1">{chef.name}</h3>
                    <p className="text-brand-olive font-medium text-sm uppercase tracking-wider">{chef.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </TabsContent>
        <TabsContent value="contact">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-12"
          >
            <Card className="border-none shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="text-2xl serif">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Your email address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea 
                    id="message" 
                    className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-olive focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <Button className="w-full bg-brand-olive hover:bg-brand-olive/90">Send Message</Button>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <div>
                <h2 className="text-3xl serif font-bold mb-6">Get in Touch</h2>
                <p className="text-slate-600 leading-relaxed mb-8">
                  Have questions about our menu, special events, or private dining? We'd love to hear from you. Reach out to us using the form or contact us directly.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-brand-cream p-3 rounded-full text-brand-olive">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Location</h3>
                    <p className="text-slate-600">11 Yuk Choi Road, Hung Hom, Kowloon, Hong Kong</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-brand-cream p-3 rounded-full text-brand-olive">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Phone</h3>
                    <p className="text-slate-600">(852) 1234 5678</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-brand-cream p-3 rounded-full text-brand-olive">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Email</h3>
                    <p className="text-slate-600">25134228d@connect.polyu.edu.hk<br /> 25127648d@connect.polyu.edu.hk <br /> 25127632d@connect.polyu.edu.hk<br />25127625d@connect.polyu.edu.hk</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}