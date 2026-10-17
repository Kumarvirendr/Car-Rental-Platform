import fs from "fs";
import razorpay from "../config/razorpay.js";
import Booking from "../models/bookingModel.js";
import { generateInvoice, invoicePathFor } from "../services/invoiceService.js";
import { BLOCKING_STATUSES } from "../utils/bookingUtils.js";


const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("vehicle", "name brand type image pricePerDay")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("vehicle", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getBookedDates = async (req, res) => {
  try {
    const bookings = await Booking.find({
      vehicle: req.params.vehicleId,
      status: { $in: BLOCKING_STATUSES },
      endDate: { $gte: new Date() },
    })
      .select("startDate endDate -_id")
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${booking.status}`,
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const isOwner = booking.user.toString() === req.user.id;

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own booking",
      });
    }

    if (!["pending", "approved"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `A ${booking.status} booking cannot be cancelled`,
      });
    }

    if (isOwner && booking.startDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "This booking has already started and cannot be cancelled",
      });
    }

    let refunded = false;

       if (booking.paymentId && booking.paymentStatus === "Paid") {
      try {
        const refund = await razorpay.payments.refund(booking.paymentId, {
          amount: Math.round(booking.totalAmount * 100),
        });

        booking.paymentStatus = "Refunded";
        booking.refundId = refund.id;
        refunded = true;
      } catch (error) {
        const description = error?.error?.description || error.message;

      
        if (description?.includes("fully refunded")) {
          booking.paymentStatus = "Refunded";
          refunded = true;
        } else {
          console.error("Refund failed:", description);

          return res.status(502).json({
            success: false,
            message: "Refund failed, so the booking was not cancelled. Please try again.",
          });
        }
      }
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({
      success: true,
      message: refunded
        ? "Booking cancelled. Your refund has been initiated."
        : "Booking cancelled",
      data: booking,
    });
  } catch (error) {
     console.error(
    "Refund failed:",
    error?.error?.description || error.message,
  );
   
  }
};

const downloadInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email")
      .populate("vehicle", "name");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const ownerId = booking.user?._id?.toString();

    if (ownerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this invoice",
      });
    }

    if (booking.paymentStatus !== "Paid" || !booking.paymentId) {
      return res.status(400).json({
        success: false,
        message: "Invoice is available only for paid bookings",
      });
    }

    const filePath = invoicePathFor(booking._id);

 
    if (!fs.existsSync(filePath)) {
      await generateInvoice({
        bookingId: booking._id,
        customerName: booking.user?.name,
        customerEmail: booking.user?.email,
        vehicleName: booking.vehicle?.name || "Vehicle",
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalAmount: booking.totalAmount,
        paymentId: booking.paymentId,
        orderId: booking.orderId,
        filePath,
      });
    }

    res.download(filePath, `invoice-${booking._id}.pdf`);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const updateBookingLifecycle = async () => {
  try {
    const now = new Date();


    await Booking.updateMany(
      { status: { $in: ["approved", "active"] }, endDate: { $lt: now } },
      { $set: { status: "completed" } },
    );

   
    await Booking.updateMany(
      { status: "approved", startDate: { $lte: now }, endDate: { $gte: now } },
      { $set: { status: "active" } },
    );
  } catch (error) {
    console.error("Booking lifecycle update failed:", error.message);
  }
};

export {
  getMyBookings,
  getAllBookings,
  getBookedDates,
  updateBookingStatus,
  cancelBooking,
  downloadInvoice,
  updateBookingLifecycle,
};