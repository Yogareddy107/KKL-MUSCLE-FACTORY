import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#090A0F",
  width: "device-width",
  initialScale: 1,
};

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kkl-muscle-factory.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "KKL Muscle Factory | Gym & Fitness Center | Koilkuntla",
    template: "%s | KKL Muscle Factory Koilkuntla",
  },
  description: "KKL Muscle Factory - Koilkuntla's #1 premier gym and fitness center. Equipped with Olympic platforms, heavy dumbbells up to 45kg+, certified trainers, and personalized diet protocols. Located behind Bus Stand Petrol Bunk, Koilkuntla.",
  keywords: [
    "KKL Muscle Factory",
    "KKL Gym Koilkuntla",
    "Gym in Koilkuntla",
    "Fitness Center Koilkuntla",
    "Best gym in Koilkuntla",
    "Bodybuilding Koilkuntla",
    "Powerlifting Gym Andhra Pradesh",
    "Weight training Koilkuntla",
    "Personal trainer Koilkuntla",
    "Gym near bus stand Koilkuntla",
    "Muscle Factory Fitness Center",
    "Custom Diet Plan Koilkuntla",
    "Kurnool district gyms",
    "Intrasphere Labs"
  ],
  authors: [{ name: "KKL Muscle Factory", url: appUrl }, { name: "Intrasphere Labs", url: "https://intraspherelabs.vercel.app" }],
  creator: "Intrasphere Labs",
  publisher: "KKL Muscle Factory",
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "KKL Muscle Factory - Gym and Fitness Center | Koilkuntla",
    description: "Build Strength. Build Discipline. Heavy iron, Olympic barbells, certified coaching, and custom diet plans in Koilkuntla, Andhra Pradesh.",
    url: appUrl,
    siteName: "KKL Muscle Factory",
    images: [
      {
        url: "/logo.png",
        width: 281,
        height: 267,
        alt: "KKL Muscle Factory Official Gym Crest Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KKL Muscle Factory - Gym and Fitness Center | Koilkuntla",
    description: "Build Strength. Build Discipline. Koilkuntla's ultimate bodybuilding, powerlifting, and fitness transformation center.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLdGym = {
  "@context": "https://schema.org",
  "@type": "ExerciseGym",
  "name": "KKL Muscle Factory - Gym and Fitness Center",
  "alternateName": "KKL Muscle Factory",
  "description": "Premier powerlifting, bodybuilding, athletic conditioning, and fitness transformation gym in Koilkuntla, Andhra Pradesh.",
  "url": appUrl,
  "telephone": "+919490862006",
  "priceRange": "₹1200 - ₹9999",
  "image": `${appUrl}/logo.png`,
  "logo": `${appUrl}/logo.png`,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Petrol Bunk Back side, Bus stand, R.K, Main Rd",
    "addressLocality": "Koilkuntla",
    "addressRegion": "Andhra Pradesh",
    "postalCode": "518134",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 15.2345,
    "longitude": 78.3182
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "05:30",
      "closes": "10:30"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "17:00",
      "closes": "21:30"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Sunday",
      "opens": "06:00",
      "closes": "10:00"
    }
  ],
  "sameAs": [
    "https://www.instagram.com/muscle_factory_fitness_center/",
    "https://www.google.com/maps/place/kkl+muscle+factory/data=!4m2!3m1!1s0x3bb447843490dd71:0xb933f80596f77482?sa=X&ved=1t:242&ictx=111",
    "https://intraspherelabs.vercel.app"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Gym Memberships",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "1 Month Starter Membership"
        },
        "price": "1200",
        "priceCurrency": "INR"
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "3 Months Strength Transformation"
        },
        "price": "3200",
        "priceCurrency": "INR"
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "6 Months Elite Bodybuilding Plan"
        },
        "price": "5800",
        "priceCurrency": "INR"
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "1 Year VIP Full Year Pass"
        },
        "price": "9999",
        "priceCurrency": "INR"
      }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGym) }}
        />
      </head>
      <body className={`${inter.variable} ${oswald.variable} min-h-screen bg-brand-dark text-brand-cream antialiased selection:bg-brand-gold selection:text-brand-dark`}>
        {children}
      </body>
    </html>
  );
}
