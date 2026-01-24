


import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from './Hero';
import Announcements from './Announcements';
import WhyUs from './WhyUs';
import ImpactSection from './ImpactSection';

export default function Main() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        
        // Optional: clear state to prevent scrolling on refresh, 
        // implies replacing history state.
        window.history.replaceState({}, document.title);
      }
    }
  }, [location]);

  return (
    <>
      <Hero />
      <Announcements />
      <WhyUs />
      <ImpactSection />
    </>
  );
}

