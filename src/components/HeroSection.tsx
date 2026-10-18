'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronRight, Dumbbell, ShieldCheck, Award, Zap } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section id="hero" className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Hero Image with dark gradient and subtle purple vignette */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.jpg"
          alt="KKL Muscle Factory Gym Floor"
          fill
          priority
          className="object-cover object-center opacity-40 scale-105 animate-pulse-slow"
        />
        {/* Dark radial and gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/85 to-brand-dark/70" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-purple-950/20 to-brand-dark pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Supplied Logo Emblem */}
        <div className="relative w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 mb-6 drop-shadow-[0_10px_35px_rgba(229,174,50,0.45)] transition-transform duration-500 hover:scale-105">
          <Image
            src="/logo.png"
            alt="KKL Muscle Factory Official Logo"
            fill
            priority
            className="object-contain"
            sizes="(max-width: 640px) 144px, (max-width: 768px) 192px, 224px"
          />
        </div>

        {/* Brand Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-surface/90 border border-brand-border-gold mb-4 shadow-gold-sm">
          <span className="w-2 h-2 rounded-full bg-brand-gold animate-ping" />
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-brand-gold">
            Gym and Fitness Center &bull; Koilkuntla
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-brand-cream max-w-5xl leading-[0.95] drop-shadow-md">
          Build Strength. <br />
          <span className="text-gold-gradient">Build Discipline.</span>
        </h1>

        {/* Short Introduction */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-brand-muted max-w-2xl font-normal leading-relaxed">
          The ultimate bodybuilding, heavy powerlifting, and physique transformation headquarters. Real iron, certified coaching, and customized nutrition protocols.
        </p>

        {/* Calls to Action */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <a
            href="#plans"
            id="hero-join-now-cta"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gold-gradient hover:opacity-95 text-brand-dark font-extrabold uppercase tracking-wider text-sm transition-all duration-300 shadow-gold-md hover:scale-105 active:scale-95"
          >
            <span>Explore Plans & Join</span>
            <ChevronRight className="w-4 h-4" />
          </a>

          <a
            href="#contact"
            id="hero-contact-cta"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-brand-surface/90 hover:bg-brand-elevated border border-brand-border hover:border-brand-gold/50 text-brand-cream font-bold uppercase tracking-wider text-sm transition-all duration-300"
          >
            <span>Contact & Location</span>
          </a>
        </div>

        {/* Highlight Feature Badges */}
        <div className="mt-14 pt-8 border-t border-brand-border/60 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-4xl text-left">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-surface/40 border border-brand-border/40">
            <div className="p-2 rounded-lg bg-brand-gold/15 text-brand-gold shrink-0">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-brand-cream">Heavy Iron</p>
              <p className="text-[11px] text-brand-muted">Dumbbells up to 45kg+</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-surface/40 border border-brand-border/40">
            <div className="p-2 rounded-lg bg-brand-gold/15 text-brand-gold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-brand-cream">Certified Coaches</p>
              <p className="text-[11px] text-brand-muted">Form checks & safety</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-surface/40 border border-brand-border/40">
            <div className="p-2 rounded-lg bg-brand-gold/15 text-brand-gold shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-brand-cream">Custom Diet</p>
              <p className="text-[11px] text-brand-muted">Targeted meal schedules</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-surface/40 border border-brand-border/40">
            <div className="p-2 rounded-lg bg-brand-gold/15 text-brand-gold shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-brand-cream">Flexible Hours</p>
              <p className="text-[11px] text-brand-muted">Morning & evening shifts</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
