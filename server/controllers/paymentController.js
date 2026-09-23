import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import Booking from "../models/bookingModel.js";
import Vehicle from './../models/vehicleModel.js';
import { sendBookingConfirmationEmail } from "../services/emailService.js";
import User from "../models/userModel.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { generateInvoice } from "../services/invoiceService.js";

const createOrder = async (req, res) => {
  try {
    const { vehicle,startDate,endDate } = req.body;

    if(!startDate || !endDate){
      return res.status(400).json({
        success:false,
        message:"Start date and end date are required",
      });
    }

    const start =new Date(startDate);
    const end = new Date(endDate);
    const today=new Date();

    today.setHours(0,0,0,0);
    if(isNaN(start.getTime()) || isNaN(end.getTime())){
      return res.status(400).json({
        success:false,
        message:"Invalid booking dates",
      });
    }

    if(start<today){
      return res.status(400).json({
        success:false,
        message:"Start date cannot be in the past",
      });
    }

    if(end<=start){
      return res.status(400).json({
        success:false,
        message:"End date must be after start date",
      })
    }
    

    if(!vehicle || !startDate || !endDate){
      return res.status(400).json({
        success:false,
        message:"Vehicle and booking dates  are required",
      })
    }

    const vehicleData = await Vehicle.findById(vehicle);

    if(!vehicleData){
      return res.status(400).json({
        success:false,
        message:"Vehile not found",
      });
    }

    const oneDay =1000*60*60*24;
    const days =Math.ceil(
      (new Date(endDate)-new Date(startDate))/oneDay
    );

   
    
    if(days <=0){
      return res.status(400).json({
        success:false,
        message:"Invalid booking dates",
      });
    }

   const totalAmount=vehicleData.pricePerDay*days;

   const existingBooking=await Booking.findOne({
    vehicle,
    status:"approved",
    startDate:{$lte:endDate},
    endDate:{$gte:startDate},
   });
   if(existingBooking){
    return res.status(400).json({
      success:false,
      message:"Vehicle is already booked for selected dates",
    });
   }

    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      totalAmount,
    });
  } catch (error) {
    console.log(error);

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

   
if (
  !razorpay_order_id ||
  !razorpay_payment_id ||
  !razorpay_signature
) {
  return res.status(400).json({
    success: false,
    message: "Payment details are incomplete",
  });
}


     
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const vehicleData=await Vehicle.findById(vehicle);
    if(!vehicleData){
      return res.status(400).json({
        success:false,
        message:"Vehicle not found"
      })
    }

    const oneDay = 1000*60*60*24;

    const days = Math.ceil(
      (new Date(endDate)-new Date(startDate))/oneDay
    )

    const totalAmount = vehicleData.pricePerDay*days;
    
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature != razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invaild Payment",
      });
    }

    const order = await razorpay.orders.fetch(razorpay_order_id);

    if(order.amount !=totalAmount*100){
      return res.status(400).json({
        success:false,
        message:"Payment amount mismatch",
      });
    }

     const payment = await razorpay.payments.fetch(
      razorpay_payment_id
     )

     if(payment.status !=="captured"){
      return res.status(400).json({
        success:false,
        message:"Payment is not captured",
      });
     }

    const existingPayment = await Booking.findOne({
      paymentId:razorpay_payment_id,
    });
    if(existingPayment){
      return res.status(400).json({
        success:false,
        message:"Payment already processed"
      })
    }


    const existingBooking = await Booking.findOne({
      vehicle,
      status: "approved",
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    });
    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Vehicle is already booked for selected dates",
      });
    }

    const user =await User.findById(req.user.id);
    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found",
      });
    }

    const booking = await Booking.create({
      user: req.user.id,
      vehicle,
      startDate,
      endDate,
      totalAmount: totalAmount,
      status: "approved",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      paymentStatus: "Paid",
    });

    const invoicePath=path.join(
      __dirname,
      "../invoices",
      `invoice-${booking._id}.pdf`
    );

  generateInvoice({
  bookingId:booking._id,
  customerName:user.name,
  customerEmail:user.email,
  vehicleName:vehicleData.name,
  startDate,
  endDate,
  totalAmount,
  paymentId:razorpay_payment_id,
  orderId:razorpay_order_id,
  filePath:invoicePath,
})

    
await sendBookingConfirmationEmail({
  email: user.email,
  name: user.name,
  vehicleName: vehicleData.name,
  startDate,
  endDate,
  totalAmount,
  paymentId: razorpay_payment_id,
  bookingId: booking._id,
   invoicePath: invoicePath,
})

    await Vehicle.findByIdAndUpdate(vehicle,{
      available:false,
    });

    res.status(200).json({
      success: true,
      message: "Payment Verified",
      booking,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Verification Failed",
    });
  }
};

export { createOrder, verifyPayment };
