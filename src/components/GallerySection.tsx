'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Camera, X, Maximize2 } from 'lucide-react';
import { GalleryItem } from '@/types';
import { getGalleryItems } from '@/lib/store';

export const GallerySection: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await getGalleryItems();
        if (isMounted) {
          setItems(data.filter(g => g.is_published));
        }
      } catch (err) {
        console.warn('Error loading gallery items:', err);
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

    const interval = setInterval(load, 12000);

    return () => {
      isMounted = false;
      window.removeEventListener('visibilitychange', handleSync);
      window.removeEventListener('focus', handleSync);
      clearInterval(interval);
    };
  }, []);

  const categories = ['All', 'Equipment', 'Gym Floor', 'Training'];

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter(i => i.category === activeCategory);

  return (
    <section id="gallery" className="py-16 sm:py-20 relative bg-brand-darker border-t border-brand-border/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-xs font-semibold uppercase tracking-wider text-brand-gold mb-3">
            <Camera className="w-3.5 h-3.5 text-brand-gold" />
            Visual Tour
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-brand-cream">
            Inside <span className="text-gold-gradient">The Iron Temple</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-brand-muted">
            Explore our state-of-the-art facility, heavy dumbbell stations, plate-loaded machinery, and intense training atmosphere.
          </p>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-gold-gradient text-brand-dark shadow-gold-sm'
                    : 'bg-brand-surface border border-brand-border text-brand-cream hover:border-brand-gold/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer bg-brand-surface border border-brand-border hover:border-brand-gold/60 transition-all duration-300 shadow-md"
            >
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-darker via-brand-darker/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold block mb-1">
                  {item.category}
                </span>
                <p className="font-heading text-sm font-bold text-brand-cream line-clamp-2">
                  {item.title}
                </p>
              </div>

              <div className="absolute top-3 right-3 p-2 rounded-lg bg-brand-dark/70 text-brand-cream opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-4 h-4 text-brand-gold" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-brand-surface rounded-2xl overflow-hidden border border-brand-border shadow-2xl"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-brand-dark/80 text-brand-cream hover:text-brand-gold transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative h-[65vh] w-full bg-black">
              <Image
                src={selectedImage.image_url}
                alt={selectedImage.title}
                fill
                className="object-contain"
              />
            </div>
            <div className="p-4 bg-brand-surface border-t border-brand-border">
              <span className="text-xs font-semibold text-brand-gold uppercase tracking-wider">
                {selectedImage.category}
              </span>
              <h4 className="font-heading text-lg font-bold text-brand-cream mt-0.5">
                {selectedImage.title}
              </h4>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
