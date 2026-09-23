import React, { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ManageVehicles = () => {
  const [vehicles, setVehicle] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const navigate =useNavigate();

  const getVehicles = async () => {
    try {
      const response = await api.get("/vehicles");
      console.log(response.data);
      setVehicle(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getVehicles();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this vehicle ?",
    );

    if (!confirmDelete) return;

    setLoadingId(id);
    try {
      const token = localStorage.getItem("token");

      const response = await api.delete(`/vehicles/${id}`, {
        headers: {
          Authorization: token,
        },
      });
      console.log(response.data);
      toast.success("Vehicle Deleted Successfully");
      getVehicles();
    } catch (error) {
      console.log(error);
      toast.error("Delete Failed");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => (
        <div
          key={vehicle._id}
          className="bg-white rounded-xl
        shadow-lg p-6 hover:shadow-2xl transition duration-300"
        >
        {vehicle.image && (
  <img
    src={`http://localhost:5000/uploads/${vehicle.image}`}
    alt={vehicle.name}
    className="w-full h-48 object-cover rounded-lg mb-4"
  />
)}


          <h2 className="text-2xl font-bold text-blue-600">{vehicle.name}</h2>
          <p className="mb-2">
            <strong>Brand:</strong> {vehicle.brand}
          </p>

          <p className="mb-2">
            <strong>Type:</strong> {vehicle.type}
          </p>

          <p className="mb-2">
            <strong>Fuel:</strong> {vehicle.fuelType}
          </p>

          <p className="text-green-600 font-bold text-xl mb-4">
            ₹{vehicle.pricePerDay}/day
          </p>

          <div className="flex gap-3">
            <button className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition"
            onClick={()=>navigate(`/admin/edit-vehicle/${vehicle._id}`)}
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(vehicle._id)}
              disabled={loadingId === vehicle._id}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex justify-center items-center"
            >
              {loadingId === vehicle._id ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ManageVehicles;
