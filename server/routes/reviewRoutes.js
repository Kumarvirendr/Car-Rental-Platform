
import  express  from 'express';
import { createReview, deleteReview, getVehicleReviews, updateReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router=express.Router();
router.post("/",protect,createReview)

router.get("/vehicle/:vehicleId",getVehicleReviews)

router.put("/:reviewId",protect,updateReview)
router.delete("/:reviewId",protect,deleteReview)






export default router;