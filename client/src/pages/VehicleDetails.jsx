import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";

function VehicleDetails() {
  const { id } = useParams();

  const [vehicle, setVehicle] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [userId, setUserId] = useState("");

  const navigate = useNavigate();

  const getVehicleDetails = async () => {
    try {
      const response = await api.get(`/vehicles/${id}`);

      setVehicle(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  const getReviews = async () => {
    try {
      const response = await api.get(`/reviews/vehicle/${id}`);

      console.log(response.data);

      setReviews(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePayment = async () => {
    try {
      const oneDay = 1000 * 60 * 60 * 24;

      const days =
        Math.ceil((new Date(endDate) - new Date(startDate)) / oneDay);

      const totalAmount = vehicle.pricePerDay * days;


      

      const { data } = await api.post("/payment/create-order", {
        vehicle:vehicle._id,
        startDate,
        endDate,
      });

      const options = {
        key: "rzp_test_TCqy8Oj04G1mgz",
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Vehicle Rental Platform",
        description: "Vehicle Booking Payment",
        order_id: data.order.id,

      

        handler: async function (response) {
          console.log(response);

          const token = localStorage.getItem("token");

          try {
            const verify = await api.post(
              "/payment/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,

                vehicle: vehicle._id,
                startDate,
                endDate,
                
              },
              {
                headers: {
                  Authorization: token,
                },
              },
            );

            console.log(verify.data);

            toast.success("Booking Successful");

            navigate("/my-bookings");
          }
           catch (error) {
            console.log(error);

            toast.error(
              error.response?.data?.message || "Payment Verification Failed",
            );
          }
        },
        modal: {
  ondismiss: function () {
    toast.info("Payment cancelled");
  },
},

        theme: {
          color: "#3399cc",
        },
      };
      const razor = new window.Razorpay(options);
      razor.on("payment.failed",function(response){
        console.log("Payment Failed:",response);

        toast.error(
          response.error?.description || "Payment Failed"
        );

      });
      razor.open();

    

    } catch (error) {
  console.log("FULL ERROR:", error);
  console.log("STATUS:", error.response?.status);
  console.log("BACKEND MESSAGE:", error.response?.data?.message);

  toast.error(
    error.response?.data?.message || "Unable to create payment order"
  );
}
  };

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      toast.warning("Please select both start and end dates");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await api.post(
        "/bookings",
        {
          vehicle: vehicle._id,
          startDate,
          endDate,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );

      console.log(response.data);

      toast.success("Booking Successful");
      setTimeout(() => {
        navigate("/my-bookings");
      }, 1500);
    } catch (error) {
      console.log(error);

      toast.error("Booking Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!comment) {
      toast.warning("Please write a comment");
      return;
    }

    try {
      setReviewLoading(true);

      const token = localStorage.getItem("token");

      const response = await api.post(
        "/reviews",
        {
          vehicle: vehicle._id,
          rating,
          comment,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );

      console.log(response.data);

      toast.success("Review Submitted");

      setComment("");
      setRating(5);

      // Vehicle details refresh
      getVehicleDetails();
      getReviews();
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Review Failed");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const token = localStorage.getItem("token");

      await api.delete(`/reviews/${reviewId}`, {
        headers: {
          Authorization: token,
        },
      });

      toast.success("Review Deleted Successfully");

      getVehicleDetails();
      getReviews();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Delete Failed");
    }
  };

  const handleUpdateReview = async () => {
    try {
      setReviewLoading(true);
      const token = localStorage.getItem("token");
      await api.put(
        `/reviews/${editingReviewId}`,
        {
          rating: editRating,
          comment: editComment,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      toast.success("Review Updated Successfully");
      setEditingReviewId(null);
      setEditRating(5);
      setEditComment("");

      getVehicleDetails();
      getReviews();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Update Failed");
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    getVehicleDetails();
    getReviews();
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserId(user._id);
    }
  }, []);

  if (!vehicle) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="flex justify-center p-8">
      <div className="w-full max-w-xl bg-white shadow-xl rounded-xl p-8 border ">
        <img
          src={`http://localhost:5000/uploads/${vehicle.image}`}
          alt={vehicle.name}
          className="w-full h-72 object-cover rounded-xl mb-6"
        />
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

        <div className="flex flex-col gap-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-3 rounded-lg"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-3 rounded-lg"
          />

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700  disabled:bg-gray-400 transition flex items-center justify-center"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Booking...</span>
              </div>
            ) : (
              "Pay Now"
            )}
          </button>
        </div>

        <hr className="my-8" />

        <h2 className="text-2xl font-bold mb-4">Give Your Review</h2>

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
        </div>

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

                {review.user?._id === userId && (
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
