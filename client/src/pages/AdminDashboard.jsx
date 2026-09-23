import React, { useEffect, useState } from "react";
import api from "./../services/api";
import { Link } from "react-router-dom";

import {
  FaUsers,
  FaCar,
  FaClipboardList,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  const getDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/admin/stats", {
        headers: {
          Authorization: token,
        },
      });

      console.log(response.data);
      setStats(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDashboardStats();
  }, []);

  if (!stats) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      <div className="flex justify-end mb-6">
        <Link
          to="/admin/add-vehicle"
          className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Add Vehicle
        </Link>

        
      </div>

        <div className="flex justify-end mb-6"> 
       <Link
          to="/admin/manage-vehicles"
          className="bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 transition"
        >
          Mange Vehicles 
        </Link>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-500 text-white p-6 rounded-xl shadow-lg flex justify-between items-center hover:scale-105 transition">
          <div>
            <h2 className="text-xl font-bold">Total Users</h2>
            <p className="text-4xl mt-2">{stats.totalUsers}</p>
          </div>

          <FaUsers size={50} />
        </div>

        <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg flex justify-between items-center hover:scale-105 transition">
          <div>
            <h2 className="text-xl font-bold">Total Vehicles</h2>
            <p className="text-4xl mt-2">{stats.totalVehicles}</p>
          </div>

          <FaCar size={50} />
        </div>

       

        <div className="bg-purple-500 text-white rounded-lg shadow-lg p-6 flex justify-between items-center hover:scale-105 transition">
          <div>
            <h2 className="text-xl font-bold">Total Bookings</h2>
            <p className="text-4xl mt-2">{stats.totalBookings}</p>
          </div>
          <FaClipboardList size={50} />
        </div>

        <div className="bg-yellow-500 text-white p-6 rounded-lg shadow-lg flex justify-between items-center hover:scale-105 transition">
          <div>
            <h2 className="text-xl font-bold">Pending Bookings</h2>
            <p className="text-4xl mt-2">{stats.pendingBookings}</p>
          </div>
          <FaClock size={50} />
        </div>

      

        <div className="bg-emerald-600 text-white p-6 rounded-lg shadow-lg flex justify-between items-center hover:scale-105 transition">
          <div>
            <h2 className="text-xl font-bold">Approved Bookings</h2>
            <p className="text-4xl mt-2">{stats.approvedBookings}</p>
          </div>
          <FaCheckCircle size={50} />
        </div>


     

          <div className="bg-red-500 text-white p-6 rounded-lg shadow-lg flex justify-between items-center hover:scale-105 transition">
          <div>
            <h2 className="text-xl font-bold">Cancelled Bookings</h2>
            <p className="text-4xl mt-2">{stats.cancelledBookings}</p>
          </div>
         <FaTimesCircle size={50} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
