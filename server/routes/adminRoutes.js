import express from "express";
import { isAdmin, protect } from "../middleware/authMiddleware.js";
import { getDashboardStats } from "../controllers/adminController.js";

const router = express.Router();

router.get("/stats", protect, isAdmin, getDashboardStats);

export default router;