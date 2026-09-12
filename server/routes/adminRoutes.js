import express from "express";
import {
  getOverview,
  getAllUsers,
  getAllSocietiesAdmin,
  getAllEventsAdmin,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("universityAdmin"));

router.get("/overview", getOverview);
router.get("/users", getAllUsers);
router.get("/societies", getAllSocietiesAdmin);
router.get("/events", getAllEventsAdmin);

export default router;