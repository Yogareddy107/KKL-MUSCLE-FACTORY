import React from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { PlansSection } from '@/components/PlansSection';
import { TrainersSection } from '@/components/TrainersSection';
import { FacilitiesSection } from '@/components/FacilitiesSection';
import { GallerySection } from '@/components/GallerySection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { WhatsAppDietButton } from '@/components/WhatsAppDietButton';
import { OfferModal } from '@/components/OfferModal';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col selection:bg-brand-gold selection:text-brand-dark">
      {/* Sticky / Floating Header */}
      <Navbar />

      {/* Special Offer Popup Modal */}
      <OfferModal />

      {/* Main Content Sections */}
      <main className="flex-1">
        <HeroSection />

        <PlansSection whatsappNumber="919490862006" />

        {/* Featured Custom Diet Callout Banner */}
        <section className="py-8 bg-brand-dark px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <WhatsAppDietButton
              whatsappNumber="919490862006"
              fallbackPhone="9490862006"
              isMemberView={false}
            />
          </div>
        </section>

        <TrainersSection />

        <FacilitiesSection />

        <GallerySection />

        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

