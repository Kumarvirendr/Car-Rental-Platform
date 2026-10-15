import React, { useEffect, useState } from "react";
import api from "../services/api";
import VehicleCard from "../components/VehicleCard";

const PAGE_SIZE = 4;

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [fuel, setFuel] = useState("");
  const [sort, setSort] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Changing any filter goes back to page 1
  const onFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const response = await api.get("/vehicles", {
          params: {
            search,
            type,
            fuelType: fuel,
            minPrice,
            maxPrice,
            sort: sort === "lowToHigh" ? "low" : sort === "highToLow" ? "high" : "",
            page,
            limit: PAGE_SIZE,
          },
        });

        setVehicles(response.data.data);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, type, fuel, minPrice, maxPrice, sort, page]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Available Vehicles</h1>

      <div className="max-w-6xl mx-auto grid md:grid-cols-6 gap-4 mb-8">
        <input
          type="text"
          placeholder="Search vehicles..."
          value={search}
          onChange={onFilterChange(setSearch)}
          className="w-full border p-3 rounded-lg shadow"
        />

        <select
          value={type}
          onChange={onFilterChange(setType)}
          className="w-full border p-3 rounded-lg shadow"
        >
          <option value="">All Types</option>
          <option value="car">Car</option>
          <option value="bike">Bike</option>
          <option value="scooty">Scooty</option>
        </select>

        <select
          value={fuel}
          onChange={onFilterChange(setFuel)}
          className="w-full border p-3 rounded-lg shadow"
        >
          <option value="">All Fuel Types</option>
          <option value="petrol">Petrol</option>
          <option value="diesel">Diesel</option>
          <option value="electric">Electric</option>
        </select>

        <select
          value={sort}
          onChange={onFilterChange(setSort)}
          className="w-full border p-3 rounded-lg shadow"
        >
          <option value="">Newest First</option>
          <option value="lowToHigh">Price : Low → High</option>
          <option value="highToLow">Price : High → Low</option>
        </select>

        <input
          type="number"
          min="0"
          placeholder="Min Price"
          value={minPrice}
          onChange={onFilterChange(setMinPrice)}
          className="w-full border p-3 rounded-lg shadow"
        />

        <input
          type="number"
          min="0"
          placeholder="Max Price"
          value={maxPrice}
          onChange={onFilterChange(setMaxPrice)}
          className="w-full border p-3 rounded-lg shadow"
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading vehicles...</p>
      ) : vehicles.length === 0 ? (
        <p className="text-center text-gray-500">No vehicles found</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle._id} vehicle={vehicle} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:bg-gray-300"
          >
            Previous
          </button>

          <span className="font-semibold">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Vehicles;