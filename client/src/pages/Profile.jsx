import { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import ChangePassword from "../components/ChangePassword";

const Profile = () => {
  const { auth, setAuth } = useAuth();
  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // GET PROFILE
  const getProfile = async () => {
    try {
      const response = await api.get("/auth/profile");

      const userData = response.data.data;

      setUser(userData);

      setName(userData.name);
      setEmail(userData.email);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to get profile"
      );
    } finally {
      setLoading(false);
    }
  };

  // UPDATE PROFILE
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!name || !email) {
      toast.error("Name and email are required");
      return;
    }

    try {
      setUpdating(true);

      const response = await api.put("/auth/profile", {
        name,
        email,
      });

      const updatedUser = response.data.data;

      setUser(updatedUser);

      // Update localStorage user
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setAuth({
        token:auth.token,
        user:updatedUser,

      })

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>

          <p className="mt-3 text-gray-600">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // PROFILE NOT FOUND
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <h2 className="text-xl font-semibold text-red-500">
          Profile not found
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
          My Profile
        </h1>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">

          {/* User Information */}
          <div className="text-center mb-8">

            <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mt-4">
              {user.name}
            </h2>

            <p className="text-gray-500">
              {user.email}
            </p>

            <span className="inline-block mt-3 bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-semibold">
              {user.role}
            </span>

          </div>

          {/* Update Form */}
          <form onSubmit={handleUpdate}>

            {/* Name */}
            <div className="mb-5">

              <label className="block text-gray-700 font-semibold mb-2">
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />

            </div>

            {/* Email */}
            <div className="mb-6">

              <label className="block text-gray-700 font-semibold mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />

            </div>

            {/* Update Button */}
            <button
              type="submit"
              disabled={updating}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {updating ? "Updating..." : "Update Profile"}
            </button>

          </form>

        </div>

<ChangePassword />
      </div>
    </div>
  );
};

export default Profile;