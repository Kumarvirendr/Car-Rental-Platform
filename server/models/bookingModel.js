import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "active",
        "completed",
        "rejected",
        "cancelled",
      ],
      default: "pending",
    },

    paymentId: {
      type: String,
    },

    orderId: {
      type: String,
    },

      refundId: {
      type: String,
    },


    paymentStatus: {
      type: String,
      default: "Paid",
      enum:["Pending","Paid","Refunded"],
      default:"Pending",
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.index({vehicle:1,status:1,startDate:1,endDate:1});

bookingSchema.index({paymentId:1},{unique:true,sparse:true});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
