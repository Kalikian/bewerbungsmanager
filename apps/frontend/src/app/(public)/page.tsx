// Landing Page
import React from 'react';
import HeroSection from '@/components/landing/hero-section';
import FeatureSection from '@/components/landing/features-sections';
import HowItWorksSection from '@/components/landing/how-it-works-section';
import CtaSection from '@/components/landing/cta-section';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeatureSection />
      <HowItWorksSection />
      <CtaSection />
    </main>
  );
}