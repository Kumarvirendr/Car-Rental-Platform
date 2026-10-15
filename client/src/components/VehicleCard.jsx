import { vehicleImageUrl } from "../config";

import { Link } from "react-router-dom";
import { UPLOADS_URL } from "../config";

const VehicleCard = ({ vehicle, className = "w-72" }) => {
  return (
    <div
      className={`${className} bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-2 transition duration-300`}
    >
      {vehicle.image ? (
        <img
          src={vehicleImageUrl(vehicle.image)}
          alt={vehicle.name}
          className="w-full h-44 object-cover"
        />
      ) : (
        <div className="w-full h-44 bg-gray-200 flex items-center justify-center text-gray-400">
          No image
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <Link to={`/vehicles/${vehicle._id}`}>
          <h3 className="text-xl font-bold text-blue-600">{vehicle.name}</h3>
        </Link>

        <p className="mt-2 text-gray-600">Brand: {vehicle.brand}</p>
        <p className="text-gray-600">Type: {vehicle.type}</p>
        <p className="text-gray-600">Fuel: {vehicle.fuelType}</p>

        <p className="mt-2 text-yellow-500 font-semibold">
          {vehicle.numReviews > 0
            ? `⭐ ${vehicle.averageRating.toFixed(1)} (${vehicle.numReviews})`
            : "No ratings yet"}
        </p>

        <p className="mt-2 text-green-600 font-bold text-lg">
          ₹{vehicle.pricePerDay}/day
        </p>

        <p className="mb-3">
          <span
            className={
              vehicle.available
                ? "text-green-600 font-semibold"
                : "text-red-600 font-semibold"
            }
          >
            {vehicle.available ? "Available" : "Not Available"}
          </span>
        </p>

        <Link
          to={`/vehicles/${vehicle._id}`}
          className="mt-auto text-center w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default VehicleCard;
