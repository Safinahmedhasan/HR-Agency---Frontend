// pages/Users/Home/Home.jsx - FIXED VERSION
import React from "react";
import HeroSection from "../../../components/Users/Home/HeroSection";
import StatsSection from "../../../components/Users/Home/StatsSection";
import TestimonialsSection from "../../../components/Users/Home/TestimonialsSection";
import CTASection from "../../../components/Users/Home/CTASection";
import DynamicServicesSection from "../../../components/Users/Home/DynamicServicesSection/DynamicServicesSection";
import DynamicWhyChooseUs from "../../../components/Users/Home/DynamicWhyChooseUs/DynamicWhyChooseUs";
import DynamicTestimonialsSection from "../../../components/Users/Home/DynamicTestimonialsSection/DynamicTestimonialsSection";

const Home = () => {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <DynamicServicesSection />
      <DynamicWhyChooseUs />
      <StatsSection />
      {/* <TestimonialsSection /> */}
      <DynamicTestimonialsSection/>
      <CTASection />
    </div>
  );
};

export default Home;
