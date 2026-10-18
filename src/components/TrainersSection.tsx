'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Award, Dumbbell, ShieldCheck, UserCheck } from 'lucide-react';
import { Trainer } from '@/types';
import { getTrainers } from '@/lib/store';

export const TrainersSection: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await getTrainers();
        if (isMounted) {
          setTrainers(data.filter(t => t.is_active));
          setLoading(false);
        }
      } catch (err) {
        console.warn('Error loading trainers:', err);
      }
    }

    load();

    const handleSync = () => {
      if (document.visibilityState === 'visible') {
        load();
      }
    };
    window.addEventListener('visibilitychange', handleSync);
    window.addEventListener('focus', handleSync);

    const interval = setInterval(load, 10000);

    return () => {
      isMounted = false;
      window.removeEventListener('visibilitychange', handleSync);
      window.removeEventListener('focus', handleSync);
      clearInterval(interval);
    };
  }, []);

  return (
    <section id="trainers" className="py-16 sm:py-20 relative bg-brand-darker border-t border-brand-border/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-xs font-semibold uppercase tracking-wider text-brand-gold mb-3">
            <UserCheck className="w-3.5 h-3.5 text-brand-gold" />
            Certified Fitness Coaches
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-brand-cream">
            Train With The <span className="text-gold-gradient">Best In Town</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-brand-muted">
            Our certified coaches are dedicated to teaching strict biomechanics, progressive overload, and injury-free athletic performance.
          </p>
        </div>

        {/* Trainers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[1, 2].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-brand-surface border border-brand-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            {trainers.map((trainer) => (
              <div
                key={trainer.id}
                className="group rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-gold/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg"
              >
                {/* Trainer Photo Container */}
                <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-brand-dark">
                  <Image
                    src={trainer.photo_url || '/images/trainer-male.jpg'}
                    alt={trainer.name}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-transparent to-transparent" />
                  
                  {/* Experience Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-brand-dark/80 backdrop-blur-md border border-brand-gold/40 text-brand-gold text-xs font-bold uppercase tracking-wider">
                    {trainer.experience}
                  </div>
                </div>

                {/* Trainer Info */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-heading text-2xl font-bold uppercase tracking-wide text-brand-cream group-hover:text-brand-gold transition-colors">
                      {trainer.name}
                    </h3>
                    <p className="text-xs font-semibold text-brand-gold uppercase tracking-wider mt-1">
                      {trainer.specialization}
                    </p>
                    <p className="text-xs text-brand-muted mt-3 leading-relaxed">
                      {trainer.bio}
                    </p>
                  </div>

                  {/* Certifications */}
                  {trainer.certifications && trainer.certifications.length > 0 && (
                    <div className="pt-3 border-t border-brand-border/60">
                      <div className="flex flex-wrap gap-1.5">
                        {trainer.certifications.map((cert, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-elevated border border-brand-border text-[11px] text-brand-cream-dim"
                          >
                            <ShieldCheck className="w-3 h-3 text-brand-gold shrink-0" />
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
