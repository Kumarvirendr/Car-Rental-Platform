import express from "express";
import {
  createVehicle,
  deleteVehicle,
  getFeaturedVehicles,
  getSingleVehicle,
  getVehicle,
  updateVehicle,
} from "../controllers/vehicleController.js";

import { isAdmin, protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getVehicle);
router.get("/featured", getFeaturedVehicles);
router.get("/:id", getSingleVehicle);

router.post("/", protect, isAdmin, upload.single("image"), createVehicle);
router.put("/:id", protect, isAdmin, upload.single("image"), updateVehicle);
router.delete("/:id", protect, isAdmin, deleteVehicle);

export default router;