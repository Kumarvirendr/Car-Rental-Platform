
import  express  from 'express';
import { isAdmin, protect } from '../middleware/authMiddleware.js';
import { cancelBooking, createBooking, getAllBookings, getMyBookings, updateBookingStatus } from '../controllers/bookingController.js';

const router=express.Router();

router.post("/",protect,createBooking);

router.get("/my-bookings",protect,getMyBookings);
router.get("/all-bookings",protect,isAdmin,getAllBookings);

router.put("/:id/status",protect,isAdmin,updateBookingStatus);
router.put("/:id/cancel",protect,cancelBooking);





export default router; 