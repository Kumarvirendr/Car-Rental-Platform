import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";

import Vehicle from "../models/vehicleModel.js";
import Booking from  "../models/bookingModel.js";
import Review from  "../models/reviewModel.js";




const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toBoolean = (value) => value === true || value === "true";
const removeCloudinaryImage=(publicId)=>{
  if(!publicId) return;

  cloudinary.uploader.destroy(publicId ,(error)=>{
    if(error){
      console.error("Could not delete image:",error.message)
    }
  })
}

///ye

const sendError = (res, error) => {
  const status = error.name === "ValidationError" ? 400 : 500;

  res.status(status).json({
    success: false,
    message: error.message,
  });
};

const createVehicle = async (req, res) => {
  try {
    const { name, brand, type, fuelType, pricePerDay, available } = req.body;

    const vehicle = await Vehicle.create({
      name,
      brand,
      type,
      fuelType,
      pricePerDay,
      available: available === undefined ? true : toBoolean(available),
      image: req.file ? req.file.path : "",
      imagePublicId: req.file ? req.file.filename : "",
    });


    res.status(201).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    if (req.file)  removeCloudinaryImage(req.file.filename);
    sendError(res, error);
  }
};



const getVehicle = async (req, res) => {
  try {
    const filter = {};

    if (req.query.search) {
      const pattern = escapeRegex(String(req.query.search));

      filter.$or = ["name", "brand", "type", "fuelType"].map((field) => ({
        [field]: { $regex: pattern, $options: "i" },
      }));
    }

    
    if(req.query.brand){
      filter.brand=req.query.brand;
    }

     if(req.query.type){
      filter.type=req.query.type;
    }

      if(req.query.fuelType){
      filter.fuelType=req.query.fuelType;
    }

      if(req.query.minPrice || req.query.maxPrice){
      filter.pricePerDay={};
    }

      if(req.query.minPrice){
      filter.pricePerDay.$gte=Number(req.query.minPrice);
    }

       if(req.query.maxPrice){
      filter.pricePerDay.$lte=Number(req.query.maxPrice);
    }


    const page = Math.max(Number(req.query.page) || 1,1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10,1),50);
    const skip = (page - 1) * limit;

   let sort = { createdAt: -1 };

   if(req.query.sort==="low") sort={pricePerDay:1};
   if(req.query.sort==="high") sort={pricePerDay:-1};

   const [vehicles,total]=await Promise.all([
    Vehicle.find(filter).sort(sort).skip(skip).limit(limit),
    Vehicle.countDocuments(filter),
   ]);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages:Math.max(Math.ceil(total/limit),1),
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    //check validation
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }
    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { getVehicleById };

const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      if(req.file) removeCloudinaryImage(req.file.filename);

      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    const {name,brand,type,fuelType,pricePerDay,available}=req.body;

     if (name !== undefined) vehicle.name = name;
    if (brand !== undefined) vehicle.brand = brand;
    if (type !== undefined) vehicle.type = type;
    if (fuelType !== undefined) vehicle.fuelType = fuelType;
    if (pricePerDay !== undefined) vehicle.pricePerDay = pricePerDay;

     if (available !== undefined) vehicle.available = toBoolean(available);


  const oldImagePublicId = vehicle.imagePublicId;

if (req.file) {
  vehicle.image = req.file.path;
  vehicle.imagePublicId = req.file.filename;
}


    await vehicle.save();

   if (req.file && oldImagePublicId) removeCloudinaryImage(oldImagePublicId);

    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    if(req.file) removeCloudinaryImage(req.file.filename);
    sendError(res,error);
  }
};



const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    const openBooking=await Booking.exists({
      vehicle:vehicle._id,
      status:{$in:["pending","approved","active"]},
      endDate:{$gte:new Date() },
    });

    if(openBooking){
      return res.status(400).json({
        success:false,
        message:"This vehicle has upcoming or active bookings and cannot be deleted"
      });
    }

    await Review.deleteMany({vehicle:vehicle._id});
    await vehicle.deleteOne();
   removeCloudinaryImage(vehicle.imagePublicId);

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




const getSingleVehicle = async (req, res) => {
  try {

    if(!mongoose.isValidObjectId(req.params.id)){
      return res.status(404).json({
        success:false,
        message:"Vehicle not found",
      })
    }



    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



const getFeaturedVehicles = async (req, res) => {
  try {

    const vehicles = await Vehicle.find()
    .sort({averageRating:-1,numReviews:-1,createdAt:-1})
    .limit(3);
    res.status(200).json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {createVehicle,getVehicle ,getSingleVehicle,updateVehicle,deleteVehicle, getFeaturedVehicles};
