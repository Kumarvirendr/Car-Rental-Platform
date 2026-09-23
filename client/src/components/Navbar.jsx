import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setAuth({
      token: null,
      user: null,
    });

    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Vehicle Rental</h1>
      <div className="flex gap-4">
        <Link to="/" className="hover:text-blue-400 transition">
          Home
        </Link>

        <Link to="/vehicles" className="hover:text-blue-400 transition">
          Vehicles
        </Link>

        {auth.user?.role === "customer" && (
          <Link to="/my-bookings" className="hover:text-blue-400 transition">
            My Bookings
          </Link>
        )}

        {auth.user?.role === "admin" && (
          <>
            <Link
              to="/admin/bookings"
              className="hover:text-blue-400 transition"
            >
              Admin Bookings
            </Link>

            <Link
              to="/admin/dashboard"
              className="hover:text-blue-400 transition"
            >
              Dashboard
            </Link>
          </>
        )}

    {auth.token ? (
  <div className="flex items-center gap-3">
    {auth.user && (
      <Link
        to="/profile"
        className="text-gray-300 hover:text-blue-400 transition"
      >
        Hi, {auth.user.name}
      </Link>
    )}

    <Link
      to="/profile"
      className="bg-green-500 px-3 py-1 rounded hover:bg-green-600 transition"
    >
      Profile
    </Link>

    <button
      onClick={handleLogout}
      className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
    >
      Logout
    </button>
  </div>
) : (
  <Link
    to="/login"
    className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600 transition"
  >
    Login
  </Link>
)}
      </div>
    </nav>
  );
};

export default Navbar;
