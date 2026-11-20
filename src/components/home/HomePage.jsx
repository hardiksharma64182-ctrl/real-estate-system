import React from 'react';
import { HeroSection } from './HeroSection';
import { FeaturedSection } from './FeaturedSection';
import { PopularLocations } from './PopularLocations';
import { AboutSection } from './AboutSection';
import { ServicesSection } from './ServicesSection';
import { TestimonialsSection } from './TestimonialsSection';
import { ContactSection } from './ContactSection';
import { PropertyDetailsModal } from '../properties/PropertyDetailsModal';
import { BookingModal } from '../bookings/BookingModal';

export const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section with Headline & Search Bar */}
      <HeroSection />

      {/* 2. Featured Properties Section */}
      <FeaturedSection />

      {/* 3. Popular Locations Section */}
      <PopularLocations />

      {/* 4. About Us Section */}
      <AboutSection />

      {/* 5. Our Services Section */}
      <ServicesSection />

      {/* 6. Customer Testimonials Section */}
      <TestimonialsSection />

      {/* 7. Contact Us Section */}
      <ContactSection />

      {/* Property Inspection Modal */}
      <PropertyDetailsModal />

      {/* Tour Booking Modal */}
      <BookingModal />
    </div>
  );
};
