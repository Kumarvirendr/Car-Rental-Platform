import Booking from "../models/bookingModel.js";
import Vehicle from "../models/vehicleModel.js";
import User from "../models/userModel.js";
import { sendBookingConfirmationEmail } from "./emailService.js";
import { generateInvoice, invoicePathFor } from "./invoiceService.js";
import { calculateDays } from "../utils/bookingUtils.js";

// Creates the booking for a captured Razorpay payment, if it doesn't already
// exist. Used by both the verify-payment flow (Step 3) and the webhook, so a
// payment can only ever produce one booking, however it gets confirmed.
export const createBookingFromPayment = async ({
  userId,
  vehicleId,
  startDate,
  endDate,
  paymentId,
  orderId,
}) => {
  const existing = await Booking.findOne({ paymentId });
  if (existing) return existing;

  const vehicleData = await Vehicle.findById(vehicleId);
  if (!vehicleData) throw new Error("Vehicle not found");

  const totalAmount =
    vehicleData.pricePerDay * calculateDays(startDate, endDate);

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  let booking;
  try {
    booking = await Booking.create({
      user: userId,
      vehicle: vehicleId,
      startDate,
      endDate,
      totalAmount,
      status: "approved",
      paymentId,
      orderId,
      paymentStatus: "Paid",
    });
  } catch (error) {
    // Someone else (verify or webhook) saved it a moment earlier
    if (error.code === 11000) {
      return await Booking.findOne({ paymentId });
    }
    throw error;
  }

  try {
    const invoicePath = invoicePathFor(booking._id);

    await generateInvoice({
      bookingId: booking._id,
      customerName: user.name,
      customerEmail: user.email,
      vehicleName: vehicleData.name,
      startDate,
      endDate,
      totalAmount,
      paymentId,
      orderId,
      filePath: invoicePath,
    });

    await sendBookingConfirmationEmail({
      email: user.email,
      name: user.name,
      vehicleName: vehicleData.name,
      startDate,
      endDate,
      totalAmount,
      paymentId,
      bookingId: booking._id,
      invoicePath,
    });
  } catch (error) {
    console.error("Invoice/email failed:", error.message);
  }

  return booking;
};