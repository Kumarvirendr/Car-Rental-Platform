import Review from "../models/reviewModel.js";
import Vehicle from "../models/vehicleModel.js";





const updateVehicleRating=async(vehicleId)=>{
  const reviews=await Review.find({
    vehicle:vehicleId,
  })

  const numReviews=reviews.length;
  let averageRating=0;

  if(numReviews>0){
    const totalRating=reviews.reduce(
      (sum,review)=> sum+review.rating,0
    );
    averageRating=totalRating/numReviews;
  }

  await Vehicle.findByIdAndUpdate(
    vehicleId,
    {
      averageRating,
      numReviews,
      reviews:reviews.map((review)=>review._id),
    }
  );

};


const createReview = async (req, res) => {
  try {
    const { vehicle, rating, comment } = req.body;

    // Vehicle exists or not

    const vehicleExists = await Vehicle.findById(vehicle);

    if (!vehicleExists) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    //Duplicate review check

    const existingReview = await Review.findOne({
      user: req.user.id,
      vehicle,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "Review already submitted",
      });
    }

    const review = await Review.create({
      user: req.user.id,
      vehicle,
      rating,
      comment,
    });

    await updateVehicleRating(vehicle);
    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getVehicleReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      vehicle: req.params.vehicleId,
    }).populate("user", "name");

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;
    res.status(200).json({
      success: true,
      count: totalReviews,
      averageRating,
      data: reviews,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};


const updateReview = async (req,res)=>{
    try{

        const {rating,comment} = req.body;

        const review = await Review.findById(req.params.reviewId);

        if(!review){
            return res.status(404).json({
                success:false,
                message:"Review not found",
            });
        }

        if(review.user.toString() !==req.user.id){
          return res.status(403).json({
            success:false,
            message:"Not authorized to update this review"
          })
        }

    review.rating = rating;
review.comment = comment;

await review.save();

await updateVehicleRating(review.vehicle);

        res.status(200).json({
            success:true,
            data:review,
        });

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

const deleteReview =async(req,res)=>{
    try{
        const review=await Review.findById(req.params.reviewId);

        if(!review){
            return res.status(404).json({
                success:false,
                message:"Review not found",
            });
        }

        if(review.user.toString() !==req.user.id){
          return res.status(403).json({
            success:false,
            message:"Not authorized to delete this review"
          })
        }

        const vehicleId = review.vehicle;
      
        await Review.findByIdAndDelete(req.params.reviewId);
        await updateVehicleRating(vehicleId);

        res.status(200).json({
            success:true,
            message:"Review deleted successfully",
        });
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}



export { createReview, getVehicleReviews,updateReview ,deleteReview};
