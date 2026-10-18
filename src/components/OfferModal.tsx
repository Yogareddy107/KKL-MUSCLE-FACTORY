'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Sparkles, MessageCircle, ArrowRight, Flame, Percent } from 'lucide-react';
import { getSpecialOffer } from '@/lib/store';
import { SpecialOffer } from '@/types';

export const OfferModal: React.FC = () => {
  const [offer, setOffer] = useState<SpecialOffer | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let isMounted = true;

    const loadOffer = async () => {
      try {
        const data = await getSpecialOffer();
        if (!isMounted) return;
        setOffer(data);

        // If offer is active, show popup after 1.2s delay if not dismissed in this session
        if (data && data.is_active) {
          const dismissed = sessionStorage.getItem('kkl_offer_seen');
          if (!dismissed) {
            timer = setTimeout(() => {
              if (isMounted) setIsOpen(true);
            }, 1200);
          }
        }
      } catch (err) {
        console.warn('Error fetching special offer:', err);
      } finally {
        if (isMounted) setHasLoaded(true);
      }
    };

    loadOffer();

    const handleSync = () => {
      if (document.visibilityState === 'visible') {
        loadOffer();
      }
    };
    window.addEventListener('visibilitychange', handleSync);
    window.addEventListener('focus', handleSync);

    const interval = setInterval(loadOffer, 15000);

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
      window.removeEventListener('visibilitychange', handleSync);
      window.removeEventListener('focus', handleSync);
      clearInterval(interval);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('kkl_offer_seen', 'true');
  };

  const handleOpenManually = () => {
    setIsOpen(true);
  };

  if (!hasLoaded || !offer || !offer.is_active) {
    return null;
  }

  return (
    <>
      {/* Floating Re-open Promo Pill (Always accessible at bottom-left) */}
      {!isOpen && (
        <button
          onClick={handleOpenManually}
          id="btn-reopen-offer"
          className="fixed bottom-5 left-4 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-amber-500 via-brand-gold to-yellow-400 text-brand-dark font-black text-xs uppercase tracking-wider shadow-[0_10px_25px_rgba(229,174,50,0.45)] hover:scale-105 active:scale-95 transition-all duration-300 animate-bounce group"
          title="Click to view special gym offer"
        >
          <Flame className="w-4 h-4 fill-current text-red-600 animate-pulse" />
          <span>Special Offer</span>
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping shrink-0" />
        </button>
      )}

      {/* Main Offer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div 
            className="relative w-full max-w-lg bg-brand-surface border-2 border-brand-gold/60 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(229,174,50,0.3)] animate-in zoom-in-95 duration-300 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              id="btn-close-offer-modal"
              className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-brand-dark/80 hover:bg-brand-dark border border-brand-gold/40 text-brand-cream hover:text-brand-gold transition-colors duration-200"
              aria-label="Close Special Offer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Poster Image Section */}
            {offer.image_url && (
              <div className="relative w-full h-48 sm:h-56 bg-brand-dark shrink-0 overflow-hidden">
                <Image
                  src={offer.image_url}
                  alt={offer.title}
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-brand-surface/30 to-transparent" />
                
                {/* Gold Discount Ribbon / Badge */}
                <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-brand-gold/80 text-[11px] font-black uppercase tracking-wider text-brand-gold shadow-gold-sm">
                  <Percent className="w-3.5 h-3.5 text-brand-gold" />
                  <span>{offer.badge || 'SPECIAL OFFER'}</span>
                </div>
              </div>
            )}

            {/* Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {!offer.image_url && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/15 border border-brand-gold/40 text-xs font-black uppercase tracking-wider text-brand-gold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{offer.badge || 'LIMITED TIME OFFER'}</span>
                </div>
              )}

              <div>
                <h3 className="font-heading text-xl sm:text-2xl font-black uppercase tracking-wide text-brand-cream leading-tight">
                  {offer.title}
                </h3>
                <p className="text-xs sm:text-sm text-brand-cream-dim leading-relaxed mt-2 whitespace-pre-line font-medium">
                  {offer.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                {offer.cta_link && (
                  <a
                    href={offer.cta_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClose}
                    id="btn-claim-offer-cta"
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gold-gradient hover:opacity-95 text-brand-dark font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-gold-sm hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>{offer.cta_text || 'Claim Offer on WhatsApp'}</span>
                  </a>
                )}

                <a
                  href="/#plans"
                  onClick={handleClose}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl border border-brand-border hover:border-brand-gold/60 bg-brand-elevated text-brand-cream hover:text-brand-gold font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Explore Plans</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="text-[10px] text-center text-brand-muted pt-1">
                Terms apply &bull; Visit front desk or contact gym management at Koilkuntla.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
