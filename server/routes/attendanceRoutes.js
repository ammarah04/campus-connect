import express from "express";
import { checkIn, getEventAttendance, getMyAttendanceHistory } from "../controllers/attendanceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/check-in", protect, checkIn);
router.get("/my", protect, getMyAttendanceHistory);
router.get("/event/:eventId", protect, getEventAttendance);

export default router;