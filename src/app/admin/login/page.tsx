'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, ArrowRight, Shield, AlertCircle, ArrowLeft, KeyRound, Delete, ExternalLink } from 'lucide-react';
import { loginWithPin } from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (data.success) {
        await loginWithPin(pin);
        router.push('/admin/dashboard');
      } else {
        setError(data.message || 'Invalid Security PIN. Please try again.');
      }
    } catch {
      // Fallback direct check
      const direct = await loginWithPin(pin);
      if (direct.success) {
        router.push('/admin/dashboard');
      } else {
        setError(direct.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickKey = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-gold/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-950/20 blur-[120px] pointer-events-none rounded-full" />

      {/* Back to site link */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brand-border bg-brand-surface/70 hover:bg-brand-surface text-xs font-semibold text-brand-muted hover:text-brand-cream transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Main Website</span>
        </Link>
      </div>

      <div className="max-w-md w-full bg-brand-surface border border-brand-border rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Supplied Logo Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative w-20 h-20 mb-2">
            <Image
              src="/logo.png"
              alt="KKL Muscle Factory Logo"
              fill
              priority
              className="object-contain"
            />
          </div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-wider text-brand-cream">
            Admin Control Center
          </h1>
          <p className="text-xs text-brand-gold uppercase tracking-widest font-semibold mt-0.5">
            KKL Muscle Factory &bull; Gym Desk
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs flex items-start gap-2.5 mb-5 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* PIN Entry Form */}
        <form onSubmit={handlePinSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2 text-center">
              Enter 4-Digit Security PIN
            </label>
            <div className="relative">
              <input
                id="admin-pin-input"
                type="password"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                placeholder="&bull;&bull;&bull;&bull;"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full text-center text-2xl tracking-[0.4em] font-mono py-3.5 px-4 rounded-xl bg-brand-elevated border border-brand-border focus:border-brand-gold text-brand-cream outline-none transition-colors"
              />
              <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
            </div>
            <p className="text-[11px] text-brand-muted/80 text-center mt-2">
              Enter your designated administrator security PIN
            </p>
          </div>

          {/* On-Screen Number Pad */}
          <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleQuickKey(num)}
                className="py-3 rounded-lg bg-brand-elevated border border-brand-border hover:border-brand-gold/60 text-base font-bold text-brand-cream hover:text-brand-gold active:scale-95 transition-all"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="py-3 rounded-lg bg-brand-elevated border border-brand-border hover:border-red-500/50 text-xs font-bold text-red-300 active:scale-95 transition-all"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleQuickKey('0')}
              className="py-3 rounded-lg bg-brand-elevated border border-brand-border hover:border-brand-gold/60 text-base font-bold text-brand-cream hover:text-brand-gold active:scale-95 transition-all"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="py-3 rounded-lg bg-brand-elevated border border-brand-border hover:border-brand-gold/50 text-xs font-bold text-brand-muted hover:text-brand-cream flex items-center justify-center active:scale-95 transition-all"
              title="Delete last digit"
            >
              <Delete className="w-4 h-4" />
            </button>
          </div>

          <button
            type="submit"
            id="admin-login-submit"
            disabled={loading || pin.length < 4}
            className="w-full py-3.5 rounded-xl bg-gold-gradient hover:opacity-95 text-brand-dark font-extrabold uppercase tracking-wider text-xs transition-all duration-300 shadow-gold-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40"
          >
            {loading ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Authorize &amp; Enter Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 pt-4 border-t border-brand-border/60 text-center">
          <p className="text-[10px] text-brand-muted flex items-center justify-center gap-1.5">
            <Shield className="w-3 h-3 text-brand-gold" />
            <span>Authorized gym personnel only. All access events are logged.</span>
          </p>
        </div>

        {/* Crafted by Intrasphere Labs */}
        <div className="mt-4 text-center">
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
      </div>
    </div>
  );
}
