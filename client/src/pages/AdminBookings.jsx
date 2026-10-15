import React, { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

const STATUS_STYLES = {
  pending: "text-yellow-600",
  approved: "text-green-600",
  active: "text-blue-600",
  completed: "text-gray-600",
  rejected: "text-red-600",
  cancelled: "text-red-600",
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);

  const getAllBookings = async () => {
    try {
      const response = await api.get("/bookings/all-bookings");
      setBookings(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Could not load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllBookings();
  }, []);

  const updateStatus = async (id, status) => {
    setLoadingId(id);

    try {
      await api.put(`/bookings/${id}/status`, { status });

      toast.success(status === "approved" ? "Booking Approved" : "Booking Rejected");
      getAllBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoadingId(null);
    }
  };

  if (loading) {
    return <p className="p-8 text-center text-gray-500">Loading bookings...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Bookings</h1>

      {bookings.length === 0 ? (
        <p className="text-gray-600">No bookings yet.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Vehicle</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Dates</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id} className="border-t">
                  <td className="p-3">
                    {booking.vehicle?.name || "Vehicle Deleted"}
                  </td>

                  <td className="p-3">
                    <p>{booking.user?.name || "User Deleted"}</p>
                    <p className="text-sm text-gray-500">{booking.user?.email}</p>
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    {booking.startDate.substring(0, 10)} to{" "}
                    {booking.endDate.substring(0, 10)}
                  </td>

                  <td className="p-3">₹{booking.totalAmount}</td>

                  <td className="p-3">{booking.paymentStatus}</td>

                  <td
                    className={`p-3 font-bold capitalize ${
                      STATUS_STYLES[booking.status] || ""
                    }`}
                  >
                    {booking.status}
                  </td>

                  <td className="p-3">
                    {booking.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(booking._id, "approved")}
                          disabled={loadingId === booking._id}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:bg-gray-400"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => updateStatus(booking._id, "rejected")}
                          disabled={loadingId === booking._id}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:bg-gray-400"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;