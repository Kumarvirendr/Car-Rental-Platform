import React from "react";

const WhyChooseUs = () => {
  return (
    <section className="py-16 bg-gray-100">
      <h2 className="text-4xl font-bold text-center mb-12">Why Choose Us?</h2>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid lg:grid-cols-4 gap-8 px-6">
        <div className="bg-white shadow-lg rounded-xl p-6 text-center hover:shadow-2xl hover:-translate-y-2 transition duration-300">
          <div className="text-5xl">🚗</div>
          <h3 className="text-xl font-bold mb-2">Best Vehicles</h3>

          <p className="text-gray-600">Wide range of premium cars and bikes.</p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 text-center hover:shadow-2xl hover:-translate-y-2 transition duration-300">
          <div className="text-5xl">💰</div>
          <h3 className="text-xl font-bold mb-2">Affordable Prices</h3>

          <p className="text-gray-600">Lowest rental price with no hidden charges.</p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 text-center hover:shadow-2xl hover:-translate-y-2 transition duration-300">
          <div className="text-5xl">⚡</div>
          <h3 className="text-xl font-bold mb-2">Instant Booking</h3>

          <p className="text-gray-600">Book your vehicle in just a few clicks.</p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 text-center hover:shadow-2xl hover:-translate-y-2 transition duration-300">
          <div className="text-5xl">🛡</div>
          <h3 className="text-xl font-bold mb-2">Trusted Service</h3>
          <p className="text-gray-600">Safe,secure and trusted by our customers.</p>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
