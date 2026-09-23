import { useEffect, useState } from "react";
import "./HeroSlider.css";

import car1 from "../assets/car1.jpg";
import car2 from "../assets/car2.jpg";
import bike1 from "../assets/bike1.jpg";
import suv from "../assets/suv.jpg";

const slides = [
  {
    image: car1,
    title: "Rent Your Dream Car",
    subtitle: "Affordable • Fast • Secure Vehicle Rentals",
    button: "Explore Cars",
  },
  {
    image: car2,
    title: "Premium Cars, Affordable Prices",
    subtitle: "Choose from our wide range of vehicles",
    button: "View Cars",
  },
  {
    image: bike1,
    title: "Ride Your Way",
    subtitle: "Rent Bikes for Your Perfect Journey",
    button: "Explore Bikes",
  },
  {
    image: suv,
    title: "Adventure Starts Here",
    subtitle: "Book your perfect SUV today",
    button: "Book Now",
  },
];

function HeroSlider() {
  const [current, setCurrent] = useState(0);

  // Automatic slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Previous
  const previousSlide = () => {
    setCurrent((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  // Next
  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="hero-slider">

      {/* Background Image */}
      <img
        src={slides[current].image}
        alt="Vehicle"
        className="hero-image"
      />

      {/* Dark Overlay */}
      <div className="hero-overlay"></div>

      {/* Content */}
      <div className="hero-content">
        <h1>{slides[current].title}</h1>

        <p>{slides[current].subtitle}</p>

        <button>
          {slides[current].button}
        </button>
      </div>

      {/* Previous Button */}
      <button
        className="slider-btn prev"
        onClick={previousSlide}
      >
        ❮
      </button>

      {/* Next Button */}
      <button
        className="slider-btn next"
        onClick={nextSlide}
      >
        ❯
      </button>

      {/* Dots */}
      <div className="slider-dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={current === index ? "dot active" : "dot"}
            onClick={() => setCurrent(index)}
          ></span>
        ))}
      </div>

    </section>
  );
}

export default HeroSlider;