import Vehicle from "../models/vehicleModel.js";

const createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create({
      ...req.body,
      image: req.file ? req.file.filename : "",
    });

    res.status(201).json({
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

export { createVehicle };

const getVehicle = async (req, res) => {
  try {
    const filter = {};

    
    if(req.query.search){
      filter.$or=[
        {
          name:{
            $regex:req.query.search,
            $options:"i",
          },
        },
         {
          brand:{
            $regex:req.query.search,
            $options:"i",
          },
        },
         {
          type:{
            $regex:req.query.search,
            $options:"i",
          },
        },
         {
          fuelType:{
            $regex:req.query.search,
            $options:"i",
          },
        },

      ];
    }

    if (req.query.brand) {
      filter.brand = req.query.brand;
    }

    if (req.query.type) {
      filter.type = req.query.type;
    }

    if (req.query.fuelType) {
      filter.fuelType = req.query.fuelType;
    }

  

    if (req.query.minPrice || req.query.maxPrice) {
      filter.pricePerDay = {};

      if (req.query.minPrice) {
        filter.pricePerDay.$gte = Number(req.query.minPrice);
      }

      if (req.query.maxPrice) {
        filter.pricePerDay.$lte = Number(req.query.maxPrice);
      }
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // const vehicles=await Vehicle.find(filter);
    let query = Vehicle.find(filter);
    if (req.query.sort === "low") {
      query = query.sort({ pricePerDay: 1 });
    }

    if (req.query.sort === "high") {
      query = query.sort({ pricePerDay: -1 });
    }
    query = query.skip(skip).limit(limit);
    const vehicles = await query;

    res.status(200).json({
      success: true,
      page,
      limit,
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

export { getVehicle };

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
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // Text fields update
    vehicle.name = req.body.name;
    vehicle.brand = req.body.brand;
    vehicle.type = req.body.type;
    vehicle.fuelType = req.body.fuelType;
    vehicle.pricePerDay = req.body.pricePerDay;
    vehicle.available = Boolean(req.body.available);

    //agar nayi image upload hui hai
    if (req.file) {
      vehicle.image = req.file.filename;
    }
    await vehicle.save();

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

export { updateVehicle };

const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle not found",
      });
    }

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
export { deleteVehicle };

const getSingleVehicle = async (req, res) => {
  try {
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

export { getSingleVehicle };

const getFeaturedVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().limit(3);
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

export { getFeaturedVehicles };
