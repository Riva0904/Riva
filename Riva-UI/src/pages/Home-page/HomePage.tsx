import React, { useState } from 'react';
import Navbar from './components/Navbar';
import MobileMenu from './components/MobileMenu';
import Hero from './components/Hero';
import Templates from './components/Templates';
import HowItWorks from './components/HowItWorks';
import VideoSection from './components/VideoSection';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import './styles.scss';

const HomePage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative overflow-hidden">
      <Navbar onMenuToggle={() => setIsMenuOpen(o => !o)} />
      <MobileMenu isOpen={isMenuOpen} />
      <main className="relative">
        <Hero />
        <Templates />
        <HowItWorks />
        <VideoSection />
        <Features />
        <Testimonials />
        <Pricing />
        <Footer />
      </main>
    </div>
  );
};

export default HomePage;
