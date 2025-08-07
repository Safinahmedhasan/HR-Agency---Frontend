// pages/Users/Home/Home.jsx - FIXED VERSION
import React from "react";
import HeroSection from "../../../components/Users/Home/HeroSection";
import WhyChooseUs from "../../../components/Users/Home/WhyChooseUs";
import StatsSection from "../../../components/Users/Home/StatsSection";
import TestimonialsSection from "../../../components/Users/Home/TestimonialsSection";
import CTASection from "../../../components/Users/Home/CTASection";
import DynamicServicesSection from "../../../components/Users/Home/DynamicServicesSection/DynamicServicesSection";

const Home = () => {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />

      <DynamicServicesSection />

      <WhyChooseUs />

      <StatsSection />

      <TestimonialsSection />

      <CTASection />
    </div>
  );
};

export default Home;
