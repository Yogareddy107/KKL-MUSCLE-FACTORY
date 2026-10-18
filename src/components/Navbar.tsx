'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, User, ChevronRight } from 'lucide-react';
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
    { name: 'Home', href: '/#hero' },
    { name: 'Plans & Pricing', href: '/#plans' },
    { name: 'Trainers', href: '/#trainers' },
    { name: 'Facilities', href: '/#facilities' },
    { name: 'Gallery', href: '/#gallery' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-none ${
        scrolled ? 'pt-2 sm:pt-3 px-3 sm:px-6 lg:px-8' : 'pt-0 px-0'
      }`}
    >
      <div
        className={`mx-auto transition-all duration-300 pointer-events-auto ${
          scrolled
            ? 'max-w-7xl rounded-2xl bg-brand-dark/92 backdrop-blur-xl border border-brand-gold/30 shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(229,174,50,0.18)] py-2 sm:py-2.5 px-4 sm:px-6'
            : 'max-w-7xl bg-brand-dark/85 backdrop-blur-md border-b border-brand-border/70 py-3 sm:py-3.5 px-4 sm:px-6 lg:px-8'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 sm:gap-3.5 group shrink-0">
            <div className="relative w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 flex-shrink-0 filter drop-shadow-[0_2px_12px_rgba(229,174,50,0.35)] transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="KKL Muscle Factory Logo"
                fill
                priority
                className="object-contain"
                sizes="(max-width: 768px) 52px, 56px"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-heading text-base sm:text-lg md:text-xl font-black tracking-wider text-brand-cream group-hover:text-brand-gold transition-colors duration-200 leading-tight whitespace-nowrap">
                KKL MUSCLE FACTORY
              </span>
              <span className="text-[9px] sm:text-[10px] text-brand-gold font-bold uppercase tracking-widest leading-tight mt-0.5">
                Gym &amp; Fitness Center
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 ml-auto mr-4 xl:mr-6">
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

          {/* Desktop Right CTAs with clean divider */}
          <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-brand-border/70 shrink-0">
            {/* Member Portal button */}
            <Link
              href={member ? '/member/dashboard' : '/member/login'}
              id="nav-member-portal"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-brand-border bg-brand-surface/80 hover:bg-brand-surface hover:border-brand-gold/60 text-xs font-bold text-brand-cream transition-all duration-200 hover:shadow-[0_0_15px_rgba(229,174,50,0.15)] whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5 text-brand-gold" />
              <span>{member ? 'My Dashboard' : 'Member Portal'}</span>
            </Link>

            {/* Primary Join Now CTA */}
            <a
              href="#plans"
              id="nav-join-btn"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-gold to-brand-gold-dark hover:from-brand-gold-light hover:to-brand-gold text-brand-dark font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-gold-sm hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <span>Join Now</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              id="mobile-menu-toggle"
              aria-label="Toggle navigation menu"
              className="p-2 rounded-lg border border-brand-border bg-brand-surface text-brand-cream hover:text-brand-gold transition-colors"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="lg:hidden mt-3 p-4 rounded-xl border border-brand-border/80 bg-brand-surface/98 backdrop-blur-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl">
            <div className="flex flex-col space-y-2 border-b border-brand-border/60 pb-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-wider text-brand-cream hover:bg-brand-elevated hover:text-brand-gold transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="pt-1 space-y-2">
              <Link
                href={member ? '/member/dashboard' : '/member/login'}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-brand-border bg-brand-elevated text-xs font-bold text-brand-cream hover:border-brand-gold/40"
              >
                <User className="w-4 h-4 text-brand-gold" />
                <span>{member ? 'My Dashboard' : 'Member Portal'}</span>
              </Link>

              <a
                href="#plans"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-brand-gold to-brand-gold-dark hover:from-brand-gold-light hover:to-brand-gold text-brand-dark font-black text-xs uppercase tracking-wider shadow-gold-sm"
              >
                <span>Explore Plans &amp; Join</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
