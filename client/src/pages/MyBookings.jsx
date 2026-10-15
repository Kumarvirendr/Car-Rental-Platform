import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

const canCancel = (booking) =>
  ["pending", "approved"].includes(booking.status) &&
  new Date(booking.startDate) > new Date();

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);

  const getMyBookings = async () => {
    try {
      const response = await api.get("/bookings/my-bookings");
      setBookings(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Could not load your bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMyBookings();
  }, []);

  const cancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking? A paid booking is refunded in full.")) {
      return;
    }

    setLoadingId(id);

    try {
      const response = await api.put(`/bookings/${id}/cancel`);

      toast.success(response.data.message || "Booking Cancelled");
      getMyBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Cancel failed");
    } finally {
      setLoadingId(null);
    }
  };

  const downloadInvoice = async (id) => {
    try {
      const response = await api.get(`/bookings/${id}/invoice`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" }),
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error("Could not download the invoice");
    }
  };

  if (loading) {
    return <p className="p-8 text-center text-gray-500">Loading bookings...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">My Bookings</h1>

      {bookings.length === 0 && (
        <p className="text-center text-gray-600">
          You have no bookings yet.{" "}
          <Link to="/vehicles" className="text-blue-600 font-semibold">
            Browse vehicles
          </Link>
        </p>
      )}

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
              <strong>Start:</strong> {booking.startDate.substring(0, 10)}
            </p>
            <p className="mb-2">
              <strong>End:</strong> {booking.endDate.substring(0, 10)}
            </p>
            <p className="mb-2">
              <strong>Amount:</strong> ₹{booking.totalAmount}
            </p>
            <p className="mb-2">
              <strong>Payment:</strong> {booking.paymentStatus}
            </p>

            <p>
              <strong>Status: </strong>
              <span
                className={`font-bold capitalize ${
                  STATUS_STYLES[booking.status] || "text-gray-600"
                }`}
              >
                {booking.status}
              </span>
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {booking.paymentStatus === "Paid" && (
                <button
                  onClick={() => downloadInvoice(booking._id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Invoice
                </button>
              )}

              {booking.status === "completed" && booking.vehicle?._id && (
                <Link
                  to={`/vehicles/${booking.vehicle._id}`}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
                >
                  Write a review
                </Link>
              )}

              {canCancel(booking) && (
                <button
                  onClick={() => cancelBooking(booking._id)}
                  disabled={loadingId === booking._id}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;