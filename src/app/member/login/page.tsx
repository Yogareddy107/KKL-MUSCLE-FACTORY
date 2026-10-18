'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, ArrowRight, AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import { loginMember } from '@/lib/auth';

export default function MemberLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await loginMember(identifier);
      if (result.success) {
        router.push('/member/dashboard');
      } else {
        setError(result.message);
      }
    } catch {
      setError('An error occurred during sign-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-gold/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-950/20 blur-[120px] pointer-events-none rounded-full" />

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
            Member Fitness Portal
          </h1>
          <p className="text-xs text-brand-gold uppercase tracking-widest font-semibold mt-0.5">
            KKL Muscle Factory &bull; Personal Dashboard
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs flex items-start gap-2.5 mb-5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
              Member ID or Registered Mobile
            </label>
            <div className="relative">
              <input
                id="member-login-input"
                type="text"
                required
                autoFocus
                placeholder="Enter Member ID or Mobile Number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full py-3.5 pl-11 pr-4 rounded-xl bg-brand-elevated border border-brand-border focus:border-brand-gold text-brand-cream text-sm outline-none transition-colors font-medium"
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
            </div>
            <p className="text-[11px] text-brand-muted mt-2">
              Assigned during gym enrollment at the reception counter.
            </p>
          </div>

          <button
            type="submit"
            id="btn-member-login-submit"
            disabled={loading || !identifier.trim()}
            className="w-full py-3.5 rounded-xl bg-gold-gradient hover:opacity-95 text-brand-dark font-extrabold uppercase tracking-wider text-xs transition-all duration-300 shadow-gold-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40"
          >
            {loading ? (
              <span>Accessing Profile...</span>
            ) : (
              <>
                <span>Access Member Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t border-brand-border/60 text-center space-y-4">
          <p className="text-[11px] text-brand-muted">
            New member? Visit our gym desk at Koilkuntla to enroll or{' '}
            <Link href="/#contact" className="text-brand-gold hover:underline">
              Submit an Enquiry
            </Link>
          </p>

          <div>
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
    </div>
  );
}
