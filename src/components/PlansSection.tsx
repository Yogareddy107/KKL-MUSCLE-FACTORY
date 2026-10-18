'use client';

import React, { useState, useEffect } from 'react';
import { Check, Star, ArrowRight, ShieldAlert } from 'lucide-react';
import { MembershipPlan } from '@/types';
import { getMembershipPlans } from '@/lib/store';

interface PlansSectionProps {
  whatsappNumber?: string;
}

export const PlansSection: React.FC<PlansSectionProps> = ({ whatsappNumber = '919490862006' }) => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await getMembershipPlans();
        if (isMounted) {
          setPlans(data.filter(p => p.is_published));
          setLoading(false);
        }
      } catch (err) {
        console.warn('Error loading plans:', err);
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

  const cleanWhatsapp = (whatsappNumber || '').replace(/[^0-9]/g, '');

  return (
    <section id="plans" className="py-16 sm:py-20 relative bg-brand-dark overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-purple-950/15 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-xs font-semibold uppercase tracking-wider text-brand-gold mb-3">
            <Star className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />
            Transparent Membership Pricing
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-brand-cream">
            Choose Your <span className="text-gold-gradient">Battle Plan</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-brand-muted">
            All plans include unlimited gym floor access, locker access, and guidance from certified instructors. Select the duration matching your transformation goals.
          </p>
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-brand-surface/50 border border-brand-border animate-pulse" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center p-12 rounded-2xl bg-brand-surface border border-brand-border max-w-lg mx-auto">
            <ShieldAlert className="w-10 h-10 text-brand-gold mx-auto mb-3" />
            <h4 className="font-heading text-lg font-bold text-brand-cream">Plans Updating</h4>
            <p className="text-xs text-brand-muted mt-1">
              Membership plans are currently being configured by the gym administrator. Please contact desk at +91 9490862006.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {plans.map((plan) => {
              const waText = encodeURIComponent(
                `Hi, I want to join KKL Muscle Factory under the "${plan.name}" plan (₹${plan.price} for ${plan.duration_months} Month${plan.duration_months > 1 ? 's' : ''}). Please confirm admission details.`
              );
              const waUrl = cleanWhatsapp ? `https://wa.me/${cleanWhatsapp}?text=${waText}` : '#contact';

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 ${
                    plan.is_popular
                      ? 'bg-gradient-to-b from-brand-surface to-brand-elevated border-2 border-brand-gold shadow-gold-md scale-[1.03] lg:-translate-y-2'
                      : 'bg-brand-surface/90 border border-brand-border hover:border-brand-gold/40 hover:shadow-lg'
                  }`}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gold-gradient text-brand-dark text-[11px] font-black uppercase tracking-wider shadow-gold-sm">
                      Most Popular Plan
                    </div>
                  )}

                  <div>
                    <h3 className="font-heading text-xl font-bold uppercase tracking-wide text-brand-cream">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-brand-muted mt-1 min-h-[32px] line-clamp-2">
                      {plan.description}
                    </p>

                    {/* Price Block */}
                    <div className="my-6 pb-6 border-b border-brand-border/80">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-brand-gold">₹</span>
                        <span className="font-heading text-4xl sm:text-5xl font-black text-brand-cream tracking-tight">
                          {plan.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-brand-muted uppercase font-semibold ml-1">
                          / {plan.duration_months} {plan.duration_months === 1 ? 'Month' : 'Months'}
                        </span>
                      </div>
                      <p className="text-[11px] text-brand-gold/90 mt-1 font-medium">
                        ₹{Math.round(plan.price / plan.duration_months).toLocaleString('en-IN')}/mo effective
                      </p>
                    </div>

                    {/* Benefits List */}
                    <ul className="space-y-3 mb-8">
                      {plan.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-brand-cream-dim">
                          <div className="w-4 h-4 rounded-full bg-brand-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-brand-gold stroke-[3]" />
                          </div>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-2">
                    <a
                      href={waUrl}
                      target={cleanWhatsapp ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
                        plan.is_popular
                          ? 'bg-gold-gradient text-brand-dark hover:opacity-95 shadow-gold-sm hover:scale-[1.02]'
                          : 'bg-brand-elevated border border-brand-border hover:border-brand-gold text-brand-cream hover:text-brand-gold'
                      }`}
                    >
                      <span>Join Plan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
