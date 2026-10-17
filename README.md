# 🚗 Vehicle Rental Platform

A full-stack MERN vehicle rental platform where users can browse, book, and pay for vehicles online, with Razorpay payments, Cloudinary image storage, and a complete admin management system.

**Live Demo:** https://car-rental-platform-theta.vercel.app
**Backend API:** https://car-rental-platform-thn2.onrender.com

> Note: The backend is hosted on Render's free tier, which spins down after inactivity. The first request may take 30-50 seconds to respond.

## Features

### For Customers
- Register/Login with JWT authentication, plus forgot/reset password via email
- Browse vehicles with search, filters (type, fuel, price) and pagination
- Real-time availability calendar — booked dates are shown and blocked per vehicle
- Secure checkout via Razorpay, with server-side amount verification
- Automatic double-booking prevention with instant refund if a conflict occurs
- Downloadable PDF invoice and email confirmation for every booking
- Cancel a booking before it starts, with full automatic refund
- Leave, edit, or delete a review and rating for any vehicle

### For Admins
- Dashboard with platform stats (users, vehicles, bookings by status)
- Full vehicle management — add, edit, delete (with Cloudinary image upload)
- View and manage all customer bookings
- Vehicles with active or upcoming bookings are protected from deletion

## Tech Stack

**Frontend:** React (Vite), Tailwind CSS, React Router, Axios, React Toastify

**Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT Authentication, Multer

**Payments:** Razorpay (Orders API, signature verification, refunds, webhooks)

**Other integrations:** Cloudinary (image storage), Nodemailer (emails), PDFKit (invoices), node-cron (booking lifecycle automation)

**Deployment:** Backend on Render, Frontend on Vercel, Database on MongoDB Atlas

## Architecture Highlights

- **Payment-first booking flow** — a booking is only created after Razorpay payment is verified server-side (signature, amount, and capture status), preventing unpaid or forged bookings
- **Razorpay webhook** as a fallback — confirms the booking even if the user's browser closes right after paying, using an idempotent booking-creation function shared with the main verify flow
- **Overlap-safe scheduling** — server-side date-range checks block double bookings; if a race condition still occurs, the second payment is automatically refunded
- **Automated booking lifecycle** — a scheduled job transitions bookings through `approved → active → completed` based on real dates
- **Role-based access control** — Customer and Admin roles, enforced both in API middleware and on the frontend routes
- **Security practices** — hashed password-reset tokens, rate-limited auth routes, generic error messages to prevent user enumeration

## Local Setup

```bash
# Clone the repo
git clone https://github.com/Kumarvirendr/Car-Rental-Platform.git
cd Car-Rental-Platform

# Backend setup
cd server
npm install
# Create a .env file with: PORT, MONGO_URL, JWT_SECRET, CLIENT_URL,
# EMAIL_USER, EMAIL_PASS, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET,
# RAZORPAY_WEBHOOK_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
# CLOUDINARY_API_SECRET
npm start

# Frontend setup (in a new terminal)
cd client
npm install
# Create a .env file with: VITE_API_URL=http://localhost:5000
npm run dev
```

## Author

**Virendra Kumar**

[GitHub](https://github.com/Kumarvirendr) · [LinkedIn](https://www.linkedin.com/in/virendra-kumar-mern/) · vk786256@gmail.com