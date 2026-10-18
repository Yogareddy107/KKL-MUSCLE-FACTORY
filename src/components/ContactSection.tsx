'use client';

import React, { useState } from 'react';
import { 
  MapPin, Phone, MessageSquare, Clock, 
  Send, CheckCircle2, AlertCircle, ExternalLink 
} from 'lucide-react';
import { InstagramIcon } from './Icons';
import { submitEnquiry } from '@/lib/store';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    plan_interest: '3 Months Strength',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const phone = '9490862006';
  const whatsapp = '919490862006';
  const address = 'petrol Bunk Back side, Bus stand, R.K, Main Rd, Koilkuntla, Andhra Pradesh 518134';
  const mapUrl = 'https://www.google.com/maps/place/kkl+muscle+factory/data=!4m2!3m1!1s0x3bb447843490dd71:0xb933f80596f77482?sa=X&ved=1t:242&ictx=111';
  const instagramUrl = 'https://www.instagram.com/muscle_factory_fitness_center/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!formData.name.trim()) {
      setFeedback({ type: 'error', text: 'Please enter your full name.' });
      return;
    }

    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      setFeedback({ type: 'error', text: 'Please enter a valid 10-digit mobile number.' });
      return;
    }

    if (!formData.message.trim()) {
      setFeedback({ type: 'error', text: 'Please provide a brief message or query.' });
      return;
    }

    setLoading(true);

    try {
      await submitEnquiry({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        plan_interest: formData.plan_interest,
        message: formData.message.trim(),
      });

      setFeedback({
        type: 'success',
        text: 'Thank you! Your enquiry has been received. Our team will contact you or message you on WhatsApp shortly.',
      });

      setFormData({
        name: '',
        phone: '',
        email: '',
        plan_interest: '3 Months Strength',
        message: '',
      });
    } catch {
      setFeedback({
        type: 'error',
        text: 'Failed to send message. Please contact us directly on WhatsApp or call our desk.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 relative bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-xs font-semibold uppercase tracking-wider text-brand-gold mb-3">
            <MapPin className="w-3.5 h-3.5 text-brand-gold" />
            Get In Touch & Visit Us
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-brand-cream">
            Ready To Start <span className="text-gold-gradient">Your Transformation?</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-brand-muted">
            Visit our facility behind the bus stand in Koilkuntla, call our front desk, or drop a quick enquiry below for gym trial passes and membership discounts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Contact Cards & Info (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Address Card */}
            <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-brand-gold/15 text-brand-gold shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading text-lg font-bold text-brand-cream uppercase tracking-wide">
                    Gym Location
                  </h4>
                  <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                    {address}
                  </p>
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-brand-gold hover:underline"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Direct Connect Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={`tel:${phone}`}
                className="p-4 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-gold flex items-center gap-3 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-brand-elevated text-brand-gold group-hover:scale-110 transition-transform">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] uppercase font-semibold text-brand-muted">Call Front Desk</p>
                  <p className="text-sm font-bold text-brand-cream">+91 {phone}</p>
                </div>
              </a>

              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hi, I want to know more about KKL Muscle Factory membership.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-brand-surface border border-brand-border hover:border-emerald-500 flex items-center gap-3 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] uppercase font-semibold text-brand-muted">Direct WhatsApp</p>
                  <p className="text-sm font-bold text-emerald-400">+91 {phone}</p>
                </div>
              </a>
            </div>

            {/* Instagram Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-brand-surface to-brand-surface border border-purple-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-purple-600 text-white">
                  <InstagramIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs uppercase font-bold text-brand-cream">Follow On Instagram</p>
                  <p className="text-[11px] text-brand-muted">@muscle_factory_fitness_center</p>
                </div>
              </div>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg bg-brand-elevated border border-brand-border hover:border-brand-gold text-xs font-bold text-brand-cream transition-colors"
              >
                Follow
              </a>
            </div>

            {/* Operating Hours Card */}
            <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-3">
              <div className="flex items-center gap-2 text-brand-gold">
                <Clock className="w-4 h-4" />
                <h4 className="font-heading text-base font-bold uppercase tracking-wide text-brand-cream">
                  Training Shift Timings
                </h4>
              </div>
              <div className="space-y-2 text-xs divide-y divide-brand-border/40 pt-1">
                <div className="flex justify-between items-center pt-2 text-brand-muted">
                  <span>Mon – Sat Morning</span>
                  <span className="font-semibold text-brand-cream">5:30 AM – 10:30 AM</span>
                </div>
                <div className="flex justify-between items-center pt-2 text-brand-muted">
                  <span>Mon – Sat Evening</span>
                  <span className="font-semibold text-brand-cream">5:00 PM – 9:30 PM</span>
                </div>
                <div className="flex justify-between items-center pt-2 text-brand-muted">
                  <span>Sunday Morning</span>
                  <span className="font-semibold text-brand-gold">6:00 AM – 10:00 AM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form (7 Cols) */}
          <div className="lg:col-span-7 bg-brand-surface rounded-2xl border border-brand-border p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <h3 className="font-heading text-2xl font-bold uppercase tracking-wide text-brand-cream mb-2">
              Send An Enquiry / Book Free Trial
            </h3>
            <p className="text-xs text-brand-muted mb-6">
              Fill out this form and our desk manager will reach out with membership package options and batch timings.
            </p>

            {feedback && (
              <div
                className={`p-4 rounded-xl mb-6 flex items-start gap-3 text-xs leading-relaxed ${
                  feedback.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-700/50 text-emerald-200'
                    : 'bg-red-950/60 border border-red-800/50 text-red-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                    Your Full Name <span className="text-brand-gold">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="e.g. Ramesh Reddy"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border focus:border-brand-gold text-brand-cream text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="contact-phone" className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                    Phone / WhatsApp Number <span className="text-brand-gold">*</span>
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    placeholder="e.g. 9490862006"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border focus:border-brand-gold text-brand-cream text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                    Email Address <span className="text-brand-muted text-[10px] lowercase">(optional)</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border focus:border-brand-gold text-brand-cream text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="contact-plan" className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                    Interested Plan
                  </label>
                  <select
                    id="contact-plan"
                    value={formData.plan_interest}
                    onChange={(e) => setFormData({ ...formData, plan_interest: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border focus:border-brand-gold text-brand-cream text-sm outline-none transition-colors"
                  >
                    <option value="1 Month Starter">1 Month Starter (₹1,200)</option>
                    <option value="3 Months Strength">3 Months Strength (₹3,200)</option>
                    <option value="6 Months Transformation">6 Months Transformation (₹5,800)</option>
                    <option value="1 Year Elite VIP">1 Year Elite VIP (₹9,999)</option>
                    <option value="Custom Diet Consultation">Custom Diet Consultation</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                  Message / Transformation Goal <span className="text-brand-gold">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  placeholder="Tell us about your fitness background, preferred workout timings, or any specific goals (e.g. fat loss, muscle building)..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border focus:border-brand-gold text-brand-cream text-sm outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                id="contact-submit-btn"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gold-gradient hover:opacity-95 text-brand-dark font-extrabold uppercase tracking-wider text-sm transition-all duration-300 shadow-gold-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <span>Submitting Enquiry...</span>
                ) : (
                  <>
                    <span>Submit Enquiry</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
