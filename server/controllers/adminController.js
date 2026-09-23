
import Booking from '../models/bookingModel.js';
import Vehicle from '../models/vehicleModel.js';
import User from './../models/userModel.js';

const getDashboardStats=async(req,res)=>{
    try{
        const totalUsers=await User.countDocuments();
        const totalVehicles=await Vehicle.countDocuments();
        const totalBookings=await Booking.countDocuments();

          const  pendingBookings=await Booking.countDocuments({
            status:"pending"
        });

          const  approvedBookings=await Booking.countDocuments({
            status:"approved"
        });

          const  cancelledBookings=await Booking.countDocuments({
            status:"cancelled"
        });

        res.status(200).json({
            success:true,
            data:{
                totalUsers,
                totalVehicles,
                totalBookings,
                pendingBookings,
                approvedBookings,
                cancelledBookings
            }
        })
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const createVehicle=async(req,res)=>{
    try{

        const vehicle=await Vehicle.create(req.body)
        res.status(201).json({
            success:true,
            data:vehicle,
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

export {getDashboardStats,createVehicle};