import Booking from "../models/bookingModel.js";
import Vehicle from "../models/vehicleModel.js";
import User from "../models/userModel.js";

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalVehicles,
      totalBookings,
      pendingBookings,
      approvedBookings,
      cancelledBookings,
    ] = await Promise.all([
      User.countDocuments(),
      Vehicle.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "approved" }),
      Booking.countDocuments({ status: "cancelled" }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalVehicles,
        totalBookings,
        pendingBookings,
        approvedBookings,
        cancelledBookings,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { getDashboardStats };