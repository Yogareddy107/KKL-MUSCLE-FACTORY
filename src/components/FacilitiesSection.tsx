'use client';

import React from 'react';
import Image from 'next/image';
import { Dumbbell, Shield, Zap, Sparkles, Activity, CheckCircle2 } from 'lucide-react';

export const FacilitiesSection: React.FC = () => {
  const facilities = [
    {
      title: 'Heavy Free-Weights & Dumbbells',
      desc: 'Complete range of commercial rubber-hex and urethane dumbbells ranging from 2.5kg to 45kg+, multi-angle incline/flat benches.',
      icon: Dumbbell,
      image: '/images/facility-dumbbells.jpg',
      features: ['2.5kg - 45kg+ Dumbbells', 'Olympic Barbell Stations', 'Multiple Adjustable Benches'],
    },
    {
      title: 'Plate-Loaded Machines & Cables',
      desc: 'Heavy-duty cable crossover stations, plate-loaded chest press, lat pulldowns, seated rows, and functional leg presses.',
      icon: Activity,
      image: '/images/facility-machines.jpg',
      features: ['Dual Cable Crossover', 'Plate-Loaded Hack Squat & Press', 'Seated Row & Lat Tower'],
    },
    {
      title: 'Olympic Lifting & Deadlift Zone',
      desc: 'High-density impact-absorbing rubber lifting platforms engineered for heavy deadlifts, cleans, and powerlifting squats.',
      icon: Zap,
      image: '/images/hero-bg.jpg',
      features: ['Solid Wooden Drop Platform', 'Competition Bumper Plates', 'Chalk Dispensers & Heavy Racks'],
    },
  ];

  return (
    <section id="facilities" className="py-20 relative bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-xs font-semibold uppercase tracking-wider text-brand-gold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            World-Class Gym Amenities
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-brand-cream">
            Built For Serious <span className="text-gold-gradient">Iron Lifters</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-brand-muted">
            Designed from the ground up for strength athletes, bodybuilders, and fitness enthusiasts who refuse to compromise on quality equipment.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {facilities.map((fac, idx) => {
            const Icon = fac.icon;
            return (
              <div
                key={idx}
                className="group rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-gold/50 transition-all duration-300 overflow-hidden flex flex-col shadow-lg"
              >
                {/* Facility Image */}
                <div className="relative h-56 w-full overflow-hidden bg-brand-dark">
                  <Image
                    src={fac.image}
                    alt={fac.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-brand-dark/80 backdrop-blur-md border border-brand-gold/40 text-brand-gold">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-heading text-xl font-bold uppercase tracking-wide text-brand-cream group-hover:text-brand-gold transition-colors">
                      {fac.title}
                    </h3>
                    <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                      {fac.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-brand-border/60 space-y-2">
                    {fac.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-brand-cream-dim">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Perks Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-brand-surface/60 border border-brand-border grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <p className="font-heading text-2xl font-bold text-brand-gold">100%</p>
            <p className="text-xs text-brand-muted uppercase font-semibold mt-0.5">Purified RO Water</p>
          </div>
          <div>
            <p className="font-heading text-2xl font-bold text-brand-gold">Daily</p>
            <p className="text-xs text-brand-muted uppercase font-semibold mt-0.5">Deep Equipment Sanitization</p>
          </div>
          <div>
            <p className="font-heading text-2xl font-bold text-brand-gold">Clean</p>
            <p className="text-xs text-brand-muted uppercase font-semibold mt-0.5">Lockers & Changing Room</p>
          </div>
          <div>
            <p className="font-heading text-2xl font-bold text-brand-gold">Surround</p>
            <p className="text-xs text-brand-muted uppercase font-semibold mt-0.5">High-Energy Audio Setup</p>
          </div>
        </div>
      </div>
    </section>
  );
};
