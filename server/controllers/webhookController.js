import crypto from "crypto";
import { createBookingFromPayment } from "../services/bookingService.js";


const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body) // raw request body (Buffer), set up in server.js
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const notes = payment.notes || {};

      if (notes.userId && notes.vehicle && notes.startDate && notes.endDate) {
        try {
          await createBookingFromPayment({
            userId: notes.userId,
            vehicleId: notes.vehicle,
            startDate: notes.startDate,
            endDate: notes.endDate,
            paymentId: payment.id,
            orderId: payment.order_id,
          });
        } catch (error) {
          console.error("Webhook booking creation failed:", error.message);
        }
      }
    }

  
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(500).json({ success: false });
  }
};

export { handleRazorpayWebhook };