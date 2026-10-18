'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, User, ChevronRight, Home, CreditCard, Dumbbell, Sparkles, Camera, Phone } from 'lucide-react';
import { getCurrentMember } from '@/lib/auth';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [member, setMember] = useState<{ full_name: string } | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    setMember(getCurrentMember());
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/#hero', icon: Home },
    { name: 'Plans', href: '/#plans', icon: CreditCard },
    { name: 'Trainers', href: '/#trainers', icon: Dumbbell },
    { name: 'Facilities', href: '/#facilities', icon: Sparkles },
    { name: 'Gallery', href: '/#gallery', icon: Camera },
    { name: 'Contact', href: '/#contact', icon: Phone },
  ];

  return (
    <header
      className={`fixed z-50 transition-all duration-300 ${
        scrolled
          ? 'top-2 sm:top-3.5 left-0 right-0 px-2 sm:px-4 md:px-6 pointer-events-none'
          : 'top-0 left-0 right-0 px-0'
      }`}
    >
      <div
        className={`transition-all duration-300 ${
          scrolled
            ? 'pointer-events-auto max-w-7xl mx-auto rounded-2xl bg-brand-dark/92 backdrop-blur-2xl border border-brand-gold/40 shadow-[0_15px_45px_rgba(0,0,0,0.9),0_0_25px_rgba(229,174,50,0.2)] py-2 sm:py-2.5 px-3 sm:px-6'
            : 'max-w-7xl mx-auto bg-brand-dark/95 backdrop-blur-md border-b border-brand-border/70 py-3 sm:py-4 px-3.5 sm:px-6 lg:px-8'
        }`}
      >
        <div className="flex items-center justify-between gap-2.5 sm:gap-4">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 shrink-0 filter drop-shadow-[0_2px_12px_rgba(229,174,50,0.4)] transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="KKL Muscle Factory Logo"
                fill
                priority
                className="object-contain"
                sizes="(max-width: 640px) 44px, (max-width: 768px) 48px, 56px"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-heading text-[15px] sm:text-lg md:text-xl font-black tracking-wider text-brand-cream group-hover:text-brand-gold transition-colors duration-200 leading-tight whitespace-nowrap">
                KKL MUSCLE FACTORY
              </span>
              <span className="text-[9px] sm:text-[10px] text-brand-gold font-bold uppercase tracking-widest leading-tight mt-0.5">
                Gym &amp; Fitness Center
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (>= lg: 1024px) */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 ml-auto mr-5 xl:mr-7">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs uppercase tracking-wider font-bold text-brand-cream-dim hover:text-brand-gold transition-colors duration-200 relative group py-1 whitespace-nowrap"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover:w-full shadow-gold-sm" />
              </a>
            ))}
          </nav>

          {/* Right CTAs Desktop (>= lg) */}
          <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-brand-border/70 shrink-0">
            <Link
              href={member ? '/member/dashboard' : '/member/login'}
              id="nav-member-portal"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 xl:px-3.5 xl:py-2 rounded-lg border border-brand-border bg-brand-surface/80 hover:bg-brand-surface hover:border-brand-gold/60 text-xs font-bold text-brand-cream transition-all duration-200 hover:shadow-[0_0_15px_rgba(229,174,50,0.15)] whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5 text-brand-gold" />
              <span>{member ? 'Dashboard' : 'Member Portal'}</span>
            </Link>

            <a
              href="#plans"
              id="nav-join-btn"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 xl:px-4 xl:py-2 rounded-lg bg-gold-gradient hover:opacity-95 text-brand-dark font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-gold-sm hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <span>Join Now</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Tablet Quick Action (sm to lg: 640px - 1023px) */}
          <div className="hidden sm:flex lg:hidden items-center gap-2">
            <Link
              href={member ? '/member/dashboard' : '/member/login'}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-brand-border bg-brand-surface text-xs font-bold text-brand-cream hover:border-brand-gold/40"
            >
              <User className="w-3.5 h-3.5 text-brand-gold" />
              <span>{member ? 'Dashboard' : 'Portal'}</span>
            </Link>

            <a
              href="#plans"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-gold-gradient text-brand-dark font-black text-xs uppercase tracking-wider shadow-gold-sm"
            >
              <span>Join</span>
            </a>
          </div>

          {/* Mobile Right Controls (< sm: phone view) */}
          <div className="flex sm:hidden items-center gap-2">
            <a
              href="#plans"
              className="px-3.5 py-1.5 rounded-lg bg-gold-gradient text-brand-dark font-black text-xs uppercase tracking-wider shadow-gold-sm hover:scale-105 active:scale-95 transition-transform"
            >
              Join
            </a>

            <button
              onClick={() => setIsOpen(!isOpen)}
              id="mobile-menu-toggle"
              aria-label="Toggle navigation menu"
              className="p-2 rounded-xl border border-brand-border bg-brand-surface text-brand-cream hover:text-brand-gold transition-colors"
            >
              {isOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          </div>

          {/* Tablet Hamburger Toggle (sm to lg) */}
          <div className="hidden sm:flex lg:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-xl border border-brand-border bg-brand-surface text-brand-cream hover:text-brand-gold transition-colors"
            >
              {isOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        {/* Compact Mobile & Tablet Dropdown Sheet */}
        {isOpen && (
          <div className="lg:hidden mt-2.5 p-3 rounded-2xl border border-brand-border/80 bg-brand-surface/98 backdrop-blur-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Compact 2-Column Links Grid */}
            <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-xl bg-brand-dark/60 border border-brand-border/50">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-brand-cream hover:text-brand-gold hover:bg-brand-elevated transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                    <span className="truncate">{link.name}</span>
                  </a>
                );
              })}
            </div>

            {/* Compact Actions Row on Mobile */}
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-brand-border/50 sm:hidden">
              <Link
                href={member ? '/member/dashboard' : '/member/login'}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border border-brand-border bg-brand-elevated text-xs font-bold text-brand-cream hover:border-brand-gold/40 truncate"
              >
                <User className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                <span className="truncate">{member ? 'Dashboard' : 'Portal'}</span>
              </Link>

              <a
                href="#plans"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-gold-gradient text-brand-dark font-black text-xs uppercase tracking-wider shadow-gold-sm truncate"
              >
                <span>Explore Plans</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

