import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendBookingConfirmationEmail = async ({
  email,
  name,
  vehicleName,
  startDate,
  endDate,
  totalAmount,
  paymentId,
  bookingId,
  invoicePath,
}) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Booking Confirmation -Vehicle Rental Platform",

    html: `
              <h2>Booking Confirmed ✅</h2>
              <p>Hello ${name},</p>
              <p>Your vehicle booking has been confirmed successfully.</p>
              <h3>Booking Details</h3>
             <p><strong>Booking ID:</strong> ${bookingId}</p>
<p><strong>Vehicle:</strong> ${vehicleName}</p>
<p><strong>Start Date:</strong> ${startDate}</p>
<p><strong>End Date:</strong> ${endDate}</p>
<p><strong>Total Amount:</strong> ₹${totalAmount}</p>
<p><strong>Payment ID:</strong> ${paymentId}</p>
<p>Thank you for choosing Vehicle Rental Platform.</p>
        `,
    attachments: [
      {
        filename: `invoice-${bookingId}.pdf`,
        path: invoicePath,
      },
    ],
  };
  await transporter.sendMail(mailOptions);
};
