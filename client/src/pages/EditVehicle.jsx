import { vehicleImageUrl } from "../config";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import { UPLOADS_URL } from "../config";

const EditVehicle = () => {
  const { id } = useParams();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [available, setAvailable] = useState(true);
  const [preview, setPreview] = useState("");
   const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const getvehicleDetails = async () => {
    try {
      const reponse = await api.get(`/vehicles/${id}`);
      console.log(reponse.data);

      const vehicle = reponse.data.data;
      setName(vehicle.name);
      setBrand(vehicle.brand);
      setType(vehicle.type);

      setFuelType(vehicle.fuelType);
      setPricePerDay(vehicle.pricePerDay);
      setAvailable(vehicle.available);
 
 setPreview(vehicleImageUrl(vehicle.image))


    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getvehicleDetails();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("brand", brand);
      formData.append("type", type);
      formData.append("fuelType", fuelType);
      formData.append("pricePerDay", pricePerDay);
      formData.append("available", available);

      if (image) {
        formData.append("image", image);
      }

      const response = await api.put(`/vehicles/${id}`, formData, {
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data",
        },
      });


      console.log(response.data);
      toast.success("Vehicle Updated Successfully");
      navigate("/admin/manage-vehicles");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to Update vehicle");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-8">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Edit Vehicle</h1>
        <form onSubmit={handleSubmit}>
          {/* vehicle Name  */}
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Vehicle Name</label>
            <input
              type="text"
              placeholder="Enter Vehicle Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-3 rounded-lg"
            />
          </div>

          {/* Brand  */}
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Brand</label>
            <input
              type="text"
              placeholder="Enter Brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full border p-3 rounded-lg"
            />
          </div>

          {/* type  */}

          <div className="mb-4">
            <label className="block mb-2 font-semibold">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border p-3 rounded-lg"
            >
              <option value="">Select Type</option>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="scooty">Scooty</option>
            </select>
          </div>

          {/* fuel  */}

          <div className="mb-4">
            <label className="block mb-2 font-semibold">Fuel Type</label>
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className="w-full border p-3 rounded-lg"
            >
              <option value="">Select Fuel</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
            </select>
          </div>

          {/* price  */}
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Price Per Day</label>
            <input
              type="number"
              placeholder="Enter Price"
              value={pricePerDay}
              onChange={(e) => setPricePerDay(e.target.value)}
              className="w-full border p-3 rounded-lg"
            />
          </div>

          {/* available  */}

          <div className="mb-6 flex items-center gap-3">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
            />

            <label>Available</label>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-semibold">
              Change Vehicle Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setImage(e.target.files[0]);
                setPreview(URL.createObjectURL(e.target.files[0]));
              }}
              className="w-full border p-3 rounded-lg"
            />

            {preview && (
              <div className="mb-4">
                <label className="block mb-2 font-semibold">
                  Current Image
                </label>

                <img
                  src={preview}
                  alt="Vehicle"
                  className="w-48 h-32 object-cover rounded-lg border shadow-md"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition flex justify-center items-center"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Updating...</span>
              </div>
            ) : (
              "Update Vehicle"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditVehicle;
