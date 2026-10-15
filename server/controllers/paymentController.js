import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Vehicle from "../models/vehicleModel.js";
import { createBookingFromPayment } from "../services/bookingService.js";
import { calculateDays, hasOverlap } from "../utils/bookingUtils.js";

const validateDates = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return "Start date and end date are required";
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return "Invalid booking dates";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    return "Start date cannot be in the past";
  }

  if (end <= start) {
    return "End date must be after start date";
  }

  return null;
};

const toPaise = (amount) => Math.round(amount * 100);

const refundPayment = async (paymentId, amount) => {
  try {
    return await razorpay.payments.refund(paymentId, { amount });
  } catch (error) {
    console.error(
      "Refund failed:",
      error?.error?.description || error.message,
    );
    return null;
  }
};

const createOrder = async (req, res) => {
  try {
    const { vehicle, startDate, endDate } = req.body;

    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle is required",
      });
    }

    const dateError = validateDates(startDate, endDate);

    if (dateError) {
      return res.status(400).json({
        success: false,
        message: dateError,
      });
    }

    const vehicleData = await Vehicle.findById(vehicle);

    if (!vehicleData) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    if (!vehicleData.available) {
      return res.status(400).json({
        success: false,
        message: "Vehicle is not available",
      });
    }

    if (await hasOverlap(vehicle, startDate, endDate)) {
      return res.status(400).json({
        success: false,
        message: "Vehicle is already booked for selected dates",
      });
    }

    const days = calculateDays(startDate, endDate);
    const totalAmount = vehicleData.pricePerDay * days;

    const order = await razorpay.orders.create({
      amount: toPaise(totalAmount),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: String(req.user.id),
        vehicle: String(vehicle),
        startDate: String(startDate),
        endDate: String(endDate),
      },
    });

    res.status(200).json({
      success: true,
      order,
      totalAmount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Order creation failed",
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      vehicle,
      startDate,
      endDate,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment details are incomplete",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment",
      });
    }

    const order = await razorpay.orders.fetch(razorpay_order_id);
    const notes = order.notes || {};

    if (
      notes.userId !== String(req.user.id) ||
      notes.vehicle !== String(vehicle) ||
      notes.startDate !== String(startDate) ||
      notes.endDate !== String(endDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment does not match this booking",
      });
    }

    const vehicleData = await Vehicle.findById(vehicle);

    if (!vehicleData) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    const totalAmount =
      vehicleData.pricePerDay * calculateDays(startDate, endDate);

    if (order.amount !== toPaise(totalAmount)) {
      return res.status(400).json({
        success: false,
        message: "Payment amount mismatch",
      });
    }

    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: "Payment is not captured",
      });
    }

    if (await hasOverlap(vehicle, startDate, endDate)) {
      const refund = await refundPayment(razorpay_payment_id, payment.amount);

      return res.status(409).json({
        success: false,
        message: refund
          ? "Vehicle was just booked by someone else. Your payment has been refunded."
          : `Vehicle was just booked by someone else. Please contact support for a refund (payment ID: ${razorpay_payment_id}).`,
      });
    }

    const booking = await createBookingFromPayment({
      userId: req.user.id,
      vehicleId: vehicle,
      startDate,
      endDate,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });

    res.status(200).json({
      success: true,
      message: "Payment Verified",
      booking,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Verification Failed",
    });
  }
};

export { createOrder, verifyPayment };