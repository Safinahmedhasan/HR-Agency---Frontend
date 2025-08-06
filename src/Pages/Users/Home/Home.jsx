// pages/Users/Home/Home.jsx
import React from "react";
import HeroSection from "../../../components/Users/Home/HeroSection";
import ServicesSection from "../../../components/Users/Home/ServicesSection";
import WhyChooseUs from "../../../components/Users/Home/WhyChooseUs";
import StatsSection from "../../../components/Users/Home/StatsSection";
import TestimonialsSection from "../../../components/Users/Home/TestimonialsSection";
import CTASection from "../../../components/Users/Home/CTASection";

const Home = () => {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />

      <ServicesSection />

      <WhyChooseUs />

      <StatsSection />

      <TestimonialsSection />

      <CTASection />
    </div>
  );
};

export default Home;
