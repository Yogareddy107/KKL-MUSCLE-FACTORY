'use client';

import React from 'react';
import { MessageSquare, AlertCircle, Phone } from 'lucide-react';

interface WhatsAppDietButtonProps {
  whatsappNumber?: string;
  fallbackPhone?: string;
  className?: string;
  isMemberView?: boolean;
}

export const WhatsAppDietButton: React.FC<WhatsAppDietButtonProps> = ({
  whatsappNumber = '919490862006',
  fallbackPhone = '9490862006',
  className = '',
  isMemberView = false,
}) => {
  // Clean phone number: remove +, spaces, dashes
  const cleanNumber = (whatsappNumber || '').replace(/[^0-9]/g, '');
  const isNumberValid = cleanNumber.length >= 10;

  const defaultMessage = isMemberView
    ? 'Hi, I am an active member of KKL Muscle Factory. I would like to discuss a customized diet plan tailored to my fitness goals. Please let me know the next steps.'
    : 'Hi, I am interested in joining KKL Muscle Factory and getting a personalized diet and training plan. Please share the details.';

  const encodedMessage = encodeURIComponent(defaultMessage);
  const waUrl = isNumberValid ? `https://wa.me/${cleanNumber}?text=${encodedMessage}` : '#';

  return (
    <div className={`rounded-xl border border-brand-border bg-gradient-to-br from-brand-surface to-brand-elevated p-6 relative overflow-hidden group shadow-lg ${className}`}>
      {/* Subtle purple and gold glow accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full blur-2xl pointer-events-none group-hover:bg-brand-gold/20 transition-all duration-500" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-900/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/15 border border-brand-gold/30 text-xs font-semibold uppercase tracking-wider text-brand-gold">
            <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
            1-on-1 Nutrition Consultation
          </div>
          <h3 className="font-heading text-2xl md:text-3xl font-bold text-brand-cream">
            Need a Custom Diet Plan?
          </h3>
          <p className="text-sm text-brand-muted leading-relaxed">
            Every physique is built in the kitchen. Connect directly with our head nutrition specialist to design a tailored meal schedule matching your target macros, vegetarian or non-vegetarian preferences.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {isNumberValid ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="btn-whatsapp-diet"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all duration-300 shadow-md hover:shadow-emerald-900/50 hover:scale-[1.02] active:scale-[0.98] text-sm whitespace-nowrap"
            >
              <MessageSquare className="w-5 h-5 fill-white/20" />
              Chat with Diet Planner on WhatsApp
            </a>
          ) : (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-950/60 border border-red-800/50 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>WhatsApp number not configured. Contact admin: {fallbackPhone}</span>
            </div>
          )}

          {fallbackPhone && (
            <a
              href={`tel:${fallbackPhone}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg bg-brand-surface border border-brand-border hover:border-brand-gold/40 text-brand-cream text-sm transition-all duration-300 hover:text-brand-gold"
              title="Call Gym Desk"
            >
              <Phone className="w-4 h-4" />
              <span>Call Desk</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
