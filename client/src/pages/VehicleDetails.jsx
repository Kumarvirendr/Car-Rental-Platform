import { vehicleImageUrl } from "../config";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { UPLOADS_URL } from "../config";

const ONE_DAY = 1000 * 60 * 60 * 24;

const todayString = () => new Date().toLocaleDateString("en-CA");

function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const userId = auth.user?._id;

  const [vehicle, setVehicle] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookedRanges, setBookedRanges] = useState([]);
  const [paying, setPaying] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  const getVehicleDetails = useCallback(async () => {
    try {
      const response = await api.get(`/vehicles/${id}`);
      setVehicle(response.data.data);
    } catch (error) {
      console.error(error);
      setNotFound(true);
    }
  }, [id]);

  const getReviews = useCallback(async () => {
    try {
      const response = await api.get(`/reviews/vehicle/${id}`);
      setReviews(response.data.data);
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  const getBookedDates = useCallback(async () => {
    try {
      const response = await api.get(`/bookings/vehicle/${id}/booked`);

      setBookedRanges(
        response.data.data.map((b) => ({
          start: b.startDate.slice(0, 10),
          end: b.endDate.slice(0, 10),
        })),
      );
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  useEffect(() => {
    getVehicleDetails();
    getReviews();
    getBookedDates();
  }, [getVehicleDetails, getReviews, getBookedDates]);

  const getDateError = () => {
    if (!startDate || !endDate) {
      return "Please select both start and end dates";
    }

    if (startDate < todayString()) {
      return "Start date cannot be in the past";
    }

    if (endDate <= startDate) {
      return "End date must be after start date";
    }

    const clash = bookedRanges.find(
      (b) => startDate <= b.end && endDate >= b.start,
    );

    if (clash) {
      return `Vehicle is already booked from ${clash.start} to ${clash.end}`;
    }

    return null;
  };

  const days =
    startDate && endDate && endDate > startDate
      ? Math.ceil((new Date(endDate) - new Date(startDate)) / ONE_DAY)
      : 0;

  const totalAmount = vehicle ? days * vehicle.pricePerDay : 0;

  const handlePayment = async () => {
    if (!auth.token) {
      toast.info("Please login to book this vehicle");
      navigate("/login");
      return;
    }

    const dateError = getDateError();

    if (dateError) {
      toast.warning(dateError);
      return;
    }

    if (!window.Razorpay) {
      toast.error("Payment service could not be loaded. Please refresh the page.");
      return;
    }

    setPaying(true);

    try {
      const { data } = await api.post("/payment/create-order", {
        vehicle: vehicle._id,
        startDate,
        endDate,
      });

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Vehicle Rental Platform",
        description: `${vehicle.name} (${days} day${days > 1 ? "s" : ""})`,
        order_id: data.order.id,
        prefill: {
          name: auth.user?.name,
          email: auth.user?.email,
        },

        handler: async function (response) {
          try {
            await api.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              vehicle: vehicle._id,
              startDate,
              endDate,
            });

            toast.success("Booking confirmed!");
            navigate("/my-bookings");
          } catch (error) {
            toast.error(
              error.response?.data?.message || "Payment verification failed",
            );
            getBookedDates();
          } finally {
            setPaying(false);
          }
        },

        modal: {
          ondismiss: function () {
            setPaying(false);
            toast.info("Payment cancelled");
          },
        },

        theme: {
          color: "#3399cc",
        },
      };

      const razor = new window.Razorpay(options);

      razor.on("payment.failed", function (response) {
        toast.error(response.error?.description || "Payment failed");
        setPaying(false);
      });

      razor.open();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to create payment order",
      );
      setPaying(false);
    }
  };

  const myReview = reviews.find((review) => review.user?._id === userId);
  const showReviewForm = auth.token && (editingReviewId || !myReview);

  const refreshAfterReviewChange = () => {
    getVehicleDetails();
    getReviews();
  };

  const handleReview = async () => {
    if (!comment.trim()) {
      toast.warning("Please write a comment");
      return;
    }

    try {
      setReviewLoading(true);

      await api.post("/reviews", {
        vehicle: vehicle._id,
        rating,
        comment,
      });

      toast.success("Review Submitted");

      setComment("");
      setRating(5);
      refreshAfterReviewChange();
    } catch (error) {
      toast.error(error.response?.data?.message || "Review Failed");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete your review?")) return;

    try {
      await api.delete(`/reviews/${reviewId}`);

      toast.success("Review Deleted Successfully");
      refreshAfterReviewChange();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete Failed");
    }
  };

  const handleUpdateReview = async () => {
    if (!editComment.trim()) {
      toast.warning("Please write a comment");
      return;
    }

    try {
      setReviewLoading(true);

      await api.put(`/reviews/${editingReviewId}`, {
        rating: editRating,
        comment: editComment,
      });

      toast.success("Review Updated Successfully");

      setEditingReviewId(null);
      setEditRating(5);
      setEditComment("");
      refreshAfterReviewChange();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update Failed");
    } finally {
      setReviewLoading(false);
    }
  };

  if (notFound) {
    return <h2 className="p-8 text-center text-xl">Vehicle not found</h2>;
  }

  if (!vehicle) {
    return <h2 className="p-8 text-center text-xl">Loading...</h2>;
  }

  const dateError = startDate && endDate ? getDateError() : null;

  return (
    <div className="flex justify-center p-8">
      <div className="w-full max-w-xl bg-white shadow-xl rounded-xl p-8 border ">
        {vehicle.image ? (
          <img
             src={vehicleImageUrl(vehicle.image)}
            alt={vehicle.name}
            className="w-full h-72 object-cover rounded-xl mb-6"
          />
        ) : (
          <div className="w-full h-72 bg-gray-200 rounded-xl mb-6 flex items-center justify-center text-gray-400">
            No image
          </div>
        )}

        <h1 className="text-4xl font-extrabold text-blue-600 mb-4">
          {vehicle.name}
        </h1>

        <p className="text-lg mb-2">Brand: {vehicle.brand}</p>
        <p className="text-lg mb-2">Type: {vehicle.type}</p>
        <p className="text-lg mb-2">Fuel: {vehicle.fuelType}</p>

        <p className="text-2xl font-bold text-green-600 mb-2">
          Price: ₹{vehicle.pricePerDay}/day
        </p>

        <div className="flex items-center gap-2 mb-6">
          <span className="text-yellow-500 text-2xl">⭐</span>

          <span className="font-bold text-lg">
            {vehicle.averageRating.toFixed(1)}
          </span>

          <span className="text-gray-500">({vehicle.numReviews} Reviews)</span>
        </div>

        <hr className="mb-6" />

        <h2 className="text-2xl font-bold mb-4">Book Vehicle</h2>

        {!vehicle.available ? (
          <p className="text-red-600 font-semibold">
            This vehicle is currently not available for booking.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {bookedRanges.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                <p className="font-semibold mb-1">Already booked:</p>
                {bookedRanges.map((range, index) => (
                  <p key={index}>
                    {range.start} to {range.end}
                  </p>
                ))}
              </div>
            )}

            <div>
              <label className="block mb-1 font-semibold">Start date</label>
              <input
                type="date"
                min={todayString()}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border p-3 rounded-lg"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">End date</label>
              <input
                type="date"
                min={startDate || todayString()}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border p-3 rounded-lg"
              />
            </div>

            {dateError && <p className="text-red-600 text-sm">{dateError}</p>}

            {days > 0 && !dateError && (
              <p className="text-lg">
                ₹{vehicle.pricePerDay} × {days} day{days > 1 ? "s" : ""} ={" "}
                <span className="font-bold text-green-600">₹{totalAmount}</span>
              </p>
            )}

            <button
              onClick={handlePayment}
              disabled={paying}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition flex items-center justify-center"
            >
              {paying ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                "Pay Now"
              )}
            </button>
          </div>
        )}

        <hr className="my-8" />

        <h2 className="text-2xl font-bold mb-4">
          {editingReviewId ? "Edit Your Review" : "Give Your Review"}
        </h2>

        {!auth.token ? (
          <p className="text-gray-600">
            <Link to="/login" className="text-blue-600 font-semibold">
              Login
            </Link>{" "}
            to write a review.
          </p>
        ) : showReviewForm ? (
          <div className="flex flex-col gap-4">
            <select
              value={editingReviewId ? editRating : rating}
              onChange={(e) =>
                editingReviewId
                  ? setEditRating(Number(e.target.value))
                  : setRating(Number(e.target.value))
              }
              className="border p-3 rounded-lg"
            >
              <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
              <option value={4}>⭐⭐⭐⭐ (4)</option>
              <option value={3}>⭐⭐⭐ (3)</option>
              <option value={2}>⭐⭐ (2)</option>
              <option value={1}>⭐ (1)</option>
            </select>

            <textarea
              rows="4"
              placeholder="Write your review..."
              value={editingReviewId ? editComment : comment}
              onChange={(e) =>
                editingReviewId
                  ? setEditComment(e.target.value)
                  : setComment(e.target.value)
              }
              className="border p-3 rounded-lg"
            />

            <button
              onClick={editingReviewId ? handleUpdateReview : handleReview}
              disabled={reviewLoading}
              className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex justify-center items-center"
            >
              {reviewLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{editingReviewId ? "Updating..." : "Submitting..."}</span>
                </div>
              ) : editingReviewId ? (
                "Update Review"
              ) : (
                "Submit Review"
              )}
            </button>

            {editingReviewId && (
              <button
                onClick={() => setEditingReviewId(null)}
                className="text-gray-600 underline"
              >
                Cancel editing
              </button>
            )}
          </div>
        ) : (
          <p className="text-gray-600">
            You have already reviewed this vehicle. You can edit or delete your
            review below.
          </p>
        )}

        <hr className="my-8" />

        <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>

        {reviews.length === 0 ? (
          <p className="text-gray-500">No Reviews Yet</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border rounded-lg p-4 shadow-sm">
                <h3 className="font-bold text-lg">
                  {review.user?.name || "Anonymous"}
                </h3>

                <p className="text-yellow-500">{"⭐".repeat(review.rating)}</p>

                <p className="mt-2 text-gray-700">{review.comment}</p>

                {userId && review.user?._id === userId && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => {
                        setEditingReviewId(review._id);
                        setEditRating(review.rating);
                        setEditComment(review.comment);
                      }}
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VehicleDetails;