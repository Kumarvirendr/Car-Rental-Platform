import React, { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);

  const [loadingId, setLoadingId] = useState(null);

  const getMyBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/bookings/my-bookings", {
        headers: {
          Authorization: token,
        },
      });

      console.log(response.data);
      setBookings(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const cancelBooking = async (id) => {
    setLoadingId(id);
    try {
      const token = localStorage.getItem("token");

      const response = await api.put(
        `/bookings/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: token,
          },
        },
      );

      console.log(response.data);
      toast.success("Booking Cancelled");
      getMyBookings();
    } catch (error) {
      console.log(error);
      toast.error("Cancel failed");
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    getMyBookings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">My Bookings</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="bg-white rounded-xl shadow-lg p-5 hover:shadow-2xl transition"
          >
            <h3 className="text-2xl font-bold mb-3">
              {booking.vehicle?.name || "Vehicle Deleted"}
            </h3>
            <p className="mb-2">
              <strong>Start:</strong>
              {""}
              {booking.startDate.substring(0, 10)}
            </p>
            <p className="mb-2">
              <strong>End:</strong>
              {""}
              {booking.endDate.substring(0, 10)}
            </p>
            <p className="mb-2">
              {" "}
              <strong>Amount:</strong>₹{booking.totalAmount}
            </p>

            <p>
              <strong>Status:</strong>

              {/* Status:{booking.status} */}
              <span
                className={
                  booking.status === "approved"
                    ? "text-green-600 font-bold"
                    : booking.status === "pending"
                      ? "text-yellow-500 font-bold"
                      : "text-red-500 font-bold"
                }
              >
                {booking.status}{" "}
              </span>
            </p>

            {booking.status !== "cancelled" && (
              <button
                onClick={() => cancelBooking(booking._id)}
                disabled={loadingId === booking._id}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition mt-2 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {/* Cancel Booking */}
                {loadingId === booking._id ? (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Cancelling...</span>
                  </div>
                ) : (
                  "Cancel Booking"
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;
