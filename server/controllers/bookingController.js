import Booking from "../models/bookingModel.js";
import Vehicle from "./../models/vehicleModel.js";

const createBooking = async (req, res) => {
  // console.log("BODY= ",req.body);
  try {
    const { vehicle, startDate, endDate } = req.body;

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

    const days =
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);

    const totalAmount = days * vehicleData.pricePerDay;

    const booking = await Booking.create({
      user: req.user.id,
      vehicle,
      startDate,
      endDate,
      totalAmount,
    });
    res.status(201).json({
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

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user.id,
    })
      .populate("user", "name email role")
      .populate("vehicle");

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
      .populate("user", "name email role")
      .populate("vehicle");
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

      if(booking.status !=="pending"){
      return res.status(400).json({
        success:false,
        message:`Booking is already ${booking.status}`,
      })
    }
 

    if(booking.status==="cancelled"){
      return res.status(400).json({
        success:false,
        message:"Booking is already cancelled",
      })
    }

    booking.status = status;

    await booking.save();

    if (status === "approved") {
      await Vehicle.findByIdAndUpdate(booking.vehicle, {
        available: false,
      });
    }

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

  

    if(booking.user.toString() !==req.user.id){
      return res.status(403).json({
        success:false,
        message:"You can only cancel your own booking",
      });
    }

    if(booking.status==="cancelled"){
      return res.status(400).json({
        success:false,
        message:"Booking is already cancelled",
      })
    }

    booking.status = "cancelled";

    await booking.save();

    


const now = new Date();


    const activeBooking=await Booking.findOne({
      vehicle:booking.vehicle,
      status:"approved",
      _id:{$ne:booking._id},

      startDate:{$lte:now},
      endDate:{$gte:now},
    });

    if(!activeBooking){
        await Vehicle.findByIdAndUpdate(booking.vehicle, {
      available: true,
        })

    }

   

    res.status(200).json({
      success: true,
      message: "Booking cancelled",
      data: booking,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};


const updateBookingLifecycle = async () => {
  try {
    const now = new Date();

    // approved booking → active
    await Booking.updateMany(
      {
        status: "approved",
        startDate: { $lte: now },
        endDate: { $gte: now },
      },
      {
        $set: {
          status: "active",
        },
      },
    );

    // active booking → completed
    await Booking.updateMany(
      {
        status: "active",
        endDate: { $lt: now },
      },
      {
        $set: {
          status: "completed",
        },
      },
    );
  } catch (error) {
    console.log("Booking lifecycle update failed:", error.message);
  }
};

export { createBooking, getMyBookings, getAllBookings, updateBookingStatus,cancelBooking,updateBookingLifecycle};
