// server/routes/driverRoutes.js
import express from "express";
import { createDriver, updateDriverStatus, getNearbyDriversAPI } from "../controllers/driverController.js";

const router = express.Router();

router.post("/", createDriver);
router.patch("/status", updateDriverStatus);
router.get("/nearby", getNearbyDriversAPI);

export default router;
