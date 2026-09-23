import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
    title: "Rent Your Dream Car",
    description: "Affordable • Fast • Secure Vehicle Rentals",
  },
  {
    image:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39",
    title: "Ride Your Way",
    description: "Premium Bikes Available for Rent",
  },
  {
    image:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf",
    title: "Adventure Starts Here",
    description: "Choose the perfect vehicle for your journey",
  },
   {
    image:
      "https://cdn.vipcars.com/postImage/long-term-car-rental-in-australia.jpg",
    title: "Adventure Starts car Here ",
    description: "Choose the perfect vehicle for your journey",
  },


  
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Automatic sliding
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Previous slide
  const previousSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  // Next slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative min-h-[80vh] overflow-hidden text-white">

      {/* Background Image */}
      <img
        src={slides[currentSlide].image}
        alt="Vehicle"
       className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative z-10 min-h-[80vh] flex flex-col justify-center items-center text-center px-4"
      >

        <h1 className="text-5xl font-bold mb-6">
          {slides[currentSlide].title}
        </h1>

        <p className="text-xl mb-8">
          {slides[currentSlide].description}
        </p>

        <Link
          to="/vehicles"
          className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          Explore Vehicles
        </Link>

      </div>

      {/* Previous Button */}
      <button
        onClick={previousSlide}
        className="absolute left-5 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 text-white text-3xl w-12 h-12 rounded-full"
      >
        ❮
      </button>

      {/* Next Button */}
      <button
        onClick={nextSlide}
        className="absolute right-5 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 text-white text-3xl w-12 h-12 rounded-full"
      >
        ❯
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition ${
              currentSlide === index
                ? "bg-white scale-125"
                : "bg-white/50"
            }`}
          ></button>
        ))}
      </div>

    </section>
  );
};

export default Hero;