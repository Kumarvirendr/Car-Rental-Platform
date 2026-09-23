import React, { useEffect, useState } from "react";
import api from "./../services/api";
import { Link } from "react-router-dom";

const FeaturedVehicles = () => {
  const [vehicles, setVehicles] = useState([]);

  const getFeaturedVehicles = async () => {
    try {
      const response = await api.get("/vehicles/featured");
      console.log(response.data);
      setVehicles(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getFeaturedVehicles();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <h2 className="text-4xl font-bold text-center mb-10">
        Featured Vehicles
      </h2>

      <div className="max-w-6xl mx-auto grid mb:grid-cols-2 lg:grid-cols-3 gap-8 px-6">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle._id}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl hover:-translate-y-2 transition duration-300 flex flex-col justify-between"
          >
            <h3 className="text-2xl font-bold md-2">{vehicle.name}</h3>

            <p className="mb-2">
              <strong>Brand:</strong> {vehicle.brand}
            </p>

            <p className="mb-2">
              <strong>Fuel:</strong> {vehicle.fuelType}
            </p>

              <p className="mb-2">
              <strong>Type:</strong> {vehicle.type}
            </p>

              <p className="text-yellow-500 font-semibold mb-2">
               ⭐ {vehicle.averageRating>0 ? vehicle.averageRating:"No Ratings"}
            </p>

             <p className="mb-3">
              <strong>Status:</strong>{' '}
              <span className={
                vehicle.available ? "text-green-600 font-bold":"text-red-600 font-bold"
              }>{vehicle.available ? "Available" :"Not Available"}</span>

            </p>

            <p className="text-green-600 font-bold text-xl mb-5">
              ₹{vehicle.pricePerDay}/day
            </p>

            <Link
              to={`/vehicles/${vehicle._id}`}
              className="bg-blue-600 text-white px-4 text-center py-2 rounded-lg hover:bg-blue-700 transition"
            >
              View Details{" "}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedVehicles;
