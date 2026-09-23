
import express from "express"
import { isAdmin, protect } from "../middleware/authMiddleware.js";
import { createVehicle, getDashboardStats } from "../controllers/adminController.js";


const router=express.Router();

router.get("/stats",protect,isAdmin,getDashboardStats);

router.post(
    "/vehicles",
    protect,
    isAdmin,
    createVehicle
);



export default router;