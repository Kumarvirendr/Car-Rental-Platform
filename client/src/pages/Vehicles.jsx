import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [fuel, setFuel] = useState("");
  const [sort, setSort] = useState("");

  const [minPrice,setMinPrice]=useState("");
  const [maxPrice,setMaxPrice]=useState("");

  const getVehicles = async () => {
    try {
      const response = await api.get("/vehicles", {
        params: {
          search: search,
          type:type,
          fuelType:fuel,
          minPrice:minPrice,
          maxPrice:maxPrice,
          sort:sort==="lowToHigh" ? "low" :sort==="highToLow" ? "high" : "",
        },
      });

      console.log(response.data);

      setVehicles(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

 

  useEffect(() => {
  const timer = setTimeout(() => {
    getVehicles();
  }, 500);

  return () => {
    clearTimeout(timer);
  };
}, [search,type,fuel,minPrice,maxPrice,sort]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Available Vehicles</h1>

      <div className="max-w-6xl mx-auto grid md:grid-cols-6 gap-4 mb-8">
        {/* Search  */}

        <input
          type="text"
          placeholder="Search vehicles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border p-3 rounded-lg shadow"
        />
        {/* Type */}
        <select
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border p-3 rounded-lg shadow"
        >
          <option value="">All Types</option>
          <option value="car">Car</option>
          <option value="bike">Bike</option>
          <option value="scooty">Scooty</option>
        </select>

        {/* Fuel */}
        <select
          value={fuel}
          onChange={(e) => setFuel(e.target.value)}
          className="w-full border p-3 rounded-lg shadow"
        >
          <option value="">All Fuel Types</option>
          <option value="petrol">Petrol</option>
          <option value="diesel">Diesel</option>
          <option value="electric">Electric</option>
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full border p-3 rounded-lg shadow"
        >
          <option value="">Default Sorting</option>
          <option value="lowToHigh">Price : Low → High</option>
          <option value="highToLow">Price : High → Low</option>
        </select>

        <input
        type="number" 
        placeholder="Min Price"
        value={minPrice}
        onChange={(e)=>setMinPrice(e.target.value)}
        className="w-full border p-3 rounded-lg shadow"
        />
        <input type="number"
        placeholder="Max Price"
        value={maxPrice}
        onChange={(e)=>setMaxPrice(e.target.value)}
         className="w-full border p-3 rounded-lg shadow"
         />
      </div>

      <div className="flex flex-wrap gap-6">
        {vehicles

          .filter((vehicle) => (type === "" ? true : vehicle.type === type))

          .filter((vehicle) => (fuel === "" ? true : vehicle.fuelType === fuel))

          

          .map((vehicle) => (
            <div
              key={vehicle._id}
              className=" w-72 bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-2 transition duration-300"
            >
              <Link to={`/vehicles/${vehicle._id}`}>
                <h3 className="text-xl font-bold text-blue-600">
                  {vehicle.name}
                </h3>
              </Link>

              <p className="mt-3 text-gray-600">Brand: {vehicle.brand}</p>

              <p className="text-gray-600">Type: {vehicle.type}</p>
              <p className="text-gray-600">Fuel: {vehicle.fuelType}</p>

              <p className="mt-3 text-green-600 font-bold text-lg">
                Price: ₹{vehicle.pricePerDay}/day
              </p>

              <p className="text-yellow-500 font-semibold mb-2">
                ⭐ {vehicle.averageRating}
              </p>

              <p className="mb-3">
                Status :
                <span
                  className={
                    vehicle.available
                      ? "text-green-600 font-bold"
                      : "text-red-600 font-bold"
                  }
                >
                  {vehicle.available ? "Available" : "Not Available"}
                </span>
              </p>

              <Link
                to={`/vehicles/${vehicle._id}`}
                className="inline-block mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                View Details
              </Link>

              {/* <hr /> */}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Vehicles;
