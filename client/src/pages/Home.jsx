import React from "react";
import Hero from "../components/Hero";
import WhyChooseUs from "../components/WhyChooseUs";
import FeaturedVehicles from "../components/FeaturedVehicles";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="p-10">
      <Hero />
      <WhyChooseUs />
      <FeaturedVehicles />
      <Footer />
    </div>
  );
};

export default Home;
