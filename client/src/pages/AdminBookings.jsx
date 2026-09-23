import React, { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);

  const [loadingId,setLoadingId]=useState(null);

  const getAllBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/bookings/all-bookings", {
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


  const approveBooking=async(id)=>{
    setLoadingId(id);
    try{
        const token = localStorage.getItem("token");

        const response=await api.put(
            `/bookings/${id}/status`,
            {
                status:"approved",
            },
            {
                headers:{
                    Authorization:token,
                },
            }
        );

        console.log(response.data);
        toast.success("Booking Approved");
        getAllBookings();
        
    }catch(error){
        console.log(error);
        toast.error("Approval Failed");
    }

    finally{
      setLoadingId(null)
    }
  }

 const rejectBooking = async (id) => {
  setLoadingId(id);

  try {
    const token = localStorage.getItem("token");

    const response = await api.put(
      `/bookings/${id}/status`,
      {
        status: "rejected",
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    console.log(response.data);

    toast.success("Booking Rejected");

    getAllBookings();
  } catch (error) {
    console.log(error);

    toast.error(
      error.response?.data?.message || "Rejection Failed"
    );
  } finally {
    setLoadingId(null);
  }
};

  useEffect(() => {
    getAllBookings();
  }, []);

  return (
    <div>
      <h1>Admin Bookings</h1>
      {bookings.map((booking) => (
        <div key={booking._id}>
          <h3>{booking.vehicle?.name || "Vehicle Deleted"}</h3>
          <p>User:{booking.user.name || "User Deleted"}</p>

          <p>Amount: ₹{booking.totalAmount }</p>

          <p>Status:{booking.status}</p>

          {booking.status === "pending" && (
  <div className="flex gap-2">

    {/* Approve Button */}
    <button
      onClick={() => approveBooking(booking._id)}
      disabled={loadingId === booking._id}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:bg-gray-400"
    >
      {loadingId === booking._id ? "Processing..." : "Approve"}
    </button>

    {/* Reject Button */}
    <button
      onClick={() => rejectBooking(booking._id)}
      disabled={loadingId === booking._id}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:bg-gray-400"
    >
      {loadingId === booking._id ? "Processing..." : "Reject"}
    </button>

  </div>
)}

       

          <hr />
        </div>
      ))}
    </div>
  );
};

export default AdminBookings;
