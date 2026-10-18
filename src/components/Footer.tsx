'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MapPin, Phone, MessageSquare, Clock, 
  ExternalLink, Shield, ChevronRight, X, Dumbbell 
} from 'lucide-react';
import { InstagramIcon } from './Icons';

export const Footer: React.FC = () => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | null>(null);

  const phone = '9490862006';
  const whatsapp = '919490862006';
  const address = 'petrol Bunk Back side, Bus stand, R.K, Main Rd, Koilkuntla, Andhra Pradesh 518134';
  const mapUrl = 'https://www.google.com/maps/place/kkl+muscle+factory/data=!4m2!3m1!1s0x3bb447843490dd71:0xb933f80596f77482?sa=X&ved=1t:242&ictx=111';
  const instagramUrl = 'https://www.instagram.com/muscle_factory_fitness_center/';

  return (
    <footer className="bg-brand-darker border-t border-brand-border/80 pt-16 pb-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-brand-gold/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand & Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-lg bg-brand-surface p-1 border border-brand-border">
                <Image
                  src="/logo.png"
                  alt="KKL Muscle Factory Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h4 className="font-heading text-xl font-bold tracking-wider text-brand-cream">
                  KKL MUSCLE FACTORY
                </h4>
                <p className="text-xs text-brand-gold uppercase tracking-widest font-semibold">
                  Gym & Fitness Center
                </p>
              </div>
            </div>
            <p className="text-sm text-brand-muted leading-relaxed">
              Build Strength. Build Discipline. Koilkuntla’s premier powerlifting, bodybuilding and athletic transformation facility.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-brand-surface border border-brand-border hover:border-brand-gold flex items-center justify-center text-brand-cream hover:text-brand-gold transition-all duration-200"
                title="Follow on Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-brand-surface border border-brand-border hover:border-emerald-500 flex items-center justify-center text-brand-cream hover:text-emerald-400 transition-all duration-200"
                title="Chat on WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a
                href={`tel:${phone}`}
                className="w-9 h-9 rounded-lg bg-brand-surface border border-brand-border hover:border-brand-gold flex items-center justify-center text-brand-cream hover:text-brand-gold transition-all duration-200"
                title="Call Directly"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-4">
            <h5 className="font-heading text-lg font-bold text-brand-cream tracking-wide border-b border-brand-border/60 pb-2">
              Quick Navigation
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#hero" className="text-brand-muted hover:text-brand-gold transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-gold" /> Home
                </a>
              </li>
              <li>
                <a href="#plans" className="text-brand-muted hover:text-brand-gold transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-gold" /> Membership Plans
                </a>
              </li>
              <li>
                <a href="#trainers" className="text-brand-muted hover:text-brand-gold transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-gold" /> Expert Trainers
                </a>
              </li>
              <li>
                <a href="#facilities" className="text-brand-muted hover:text-brand-gold transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-gold" /> Gym Facilities
                </a>
              </li>
              <li>
                <a href="#gallery" className="text-brand-muted hover:text-brand-gold transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-gold" /> Photo Gallery
                </a>
              </li>
              <li>
                <a href="#contact" className="text-brand-muted hover:text-brand-gold transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-gold" /> Contact & Location
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Operating Hours */}
          <div className="space-y-4">
            <h5 className="font-heading text-lg font-bold text-brand-cream tracking-wide border-b border-brand-border/60 pb-2">
              Training Hours
            </h5>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5 text-brand-cream-dim">
                <Clock className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-brand-cream">Monday – Saturday</p>
                  <p className="text-brand-muted text-xs">Morning: 5:30 AM – 10:30 AM</p>
                  <p className="text-brand-muted text-xs">Evening: 5:00 PM – 9:30 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-brand-cream-dim pt-1 border-t border-brand-border/40">
                <Clock className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-brand-cream">Sunday Session</p>
                  <p className="text-brand-muted text-xs">Morning Only: 6:00 AM – 10:00 AM</p>
                  <p className="text-xs text-amber-500/80">Evening closed for deep cleaning</p>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Location & Contact */}
          <div className="space-y-4">
            <h5 className="font-heading text-lg font-bold text-brand-cream tracking-wide border-b border-brand-border/60 pb-2">
              Gym Location
            </h5>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5 text-brand-muted">
                <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-1" />
                <span className="leading-snug">{address}</span>
              </div>
              <div className="flex items-center gap-2.5 text-brand-muted">
                <Phone className="w-4 h-4 text-brand-gold shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-brand-gold transition-colors font-medium">
                  +91 {phone}
                </a>
              </div>
              <div className="pt-1">
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border bg-brand-surface hover:border-brand-gold/50 text-xs font-semibold text-brand-cream hover:text-brand-gold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-brand-border/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brand-muted">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span>&copy; {new Date().getFullYear()} KKL Muscle Factory. All rights reserved.</span>
            <span className="hidden sm:inline text-brand-border">&bull;</span>
            <a
              href="https://intraspherelabs.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-brand-gold/15 to-purple-950/40 border border-brand-gold/40 text-[11px] font-bold text-brand-gold hover:text-brand-cream hover:border-brand-gold transition-all duration-300 shadow-gold-sm hover:scale-105"
            >
              <span>Crafted by Intrasphere Labs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setModalType('privacy')}
              className="hover:text-brand-gold transition-colors underline-offset-4 hover:underline"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setModalType('terms')}
              className="hover:text-brand-gold transition-colors underline-offset-4 hover:underline"
            >
              Gym Terms & Rules
            </button>

            {/* Secret Dumbbell Link to Admin Desk */}
            <Link
              href="/admin/login"
              aria-label="Staff Portal"
              title="Staff Portal"
              className="p-1.5 rounded-lg text-brand-muted/30 hover:text-brand-gold hover:bg-brand-surface transition-colors"
            >
              <Dumbbell className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Privacy Policy & Terms Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-xl max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-cream hover:bg-brand-elevated"
            >
              <X className="w-4 h-4" />
            </button>

            {modalType === 'privacy' ? (
              <div className="space-y-4">
                <h3 className="font-heading text-xl font-bold text-brand-cream">
                  Privacy Policy - KKL Muscle Factory
                </h3>
                <div className="text-xs text-brand-muted space-y-3 leading-relaxed">
                  <p>
                    KKL Muscle Factory values your privacy. We collect essential contact information (name, phone number, emergency contact) solely for membership management, workout and diet assignment, and safety purposes.
                  </p>
                  <p>
                    We do not share, sell, or disclose your personal data to any external commercial marketing agencies.
                  </p>
                  <p>
                    If you have questions about your stored data, reach out to gym management at +91 {phone} or at our front desk.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-heading text-xl font-bold text-brand-cream">
                  Gym Rules & Membership Terms
                </h3>
                <div className="text-xs text-brand-muted space-y-3 leading-relaxed">
                  <p>1. <strong>Footwear & Apparel:</strong> Clean sports shoes and proper athletic gym attire are mandatory inside the workout floor.</p>
                  <p>2. <strong>Equipment Etiquette:</strong> Always re-rack barbells, dumbbells, and weight plates after completing sets. Wipe down equipment after intense sessions.</p>
                  <p>3. <strong>Check-in:</strong> Members must record their daily attendance check-in upon entry.</p>
                  <p>4. <strong>Safety First:</strong> Utilize safety bars in squat racks and request a trainer or spotter when attempting maximum lifts.</p>
                  <p>5. <strong>Diet Plans:</strong> Custom nutritional guidance is formulated strictly for healthy fitness development. Disclose any medical allergies to your coach.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};
