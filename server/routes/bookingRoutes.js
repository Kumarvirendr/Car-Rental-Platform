import express from "express";
import { isAdmin, protect } from "../middleware/authMiddleware.js";
import {
  cancelBooking,
  downloadInvoice,
  getAllBookings,
  getBookedDates,
  getMyBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";

const router = express.Router();

router.get("/my-bookings", protect, getMyBookings);
router.get("/all-bookings", protect, isAdmin, getAllBookings);


router.get("/vehicle/:vehicleId/booked", getBookedDates);

router.get("/:id/invoice", protect, downloadInvoice);

router.put("/:id/status", protect, isAdmin, updateBookingStatus);
router.put("/:id/cancel", protect, cancelBooking);

export default router;