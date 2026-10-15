import React, { useEffect, useState } from "react";
import api from "./../services/api";
import VehicleCard from "./VehicleCard";

const FeaturedVehicles = () => {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const getFeaturedVehicles = async () => {
      try {
        const response = await api.get("/vehicles/featured");
        setVehicles(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    getFeaturedVehicles();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <h2 className="text-4xl font-bold text-center mb-10">
        Featured Vehicles
      </h2>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-6">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle._id} vehicle={vehicle} className="w-full" />
        ))}
      </div>
    </section>
  );
};

export default FeaturedVehicles;