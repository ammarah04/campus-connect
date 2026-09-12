import express from "express";
import {
  registerForEvent,
  cancelRegistration,
  getMyRegistrationStatus,
  getMyRegisteredEvents,
} from "../controllers/registrationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my/registrations", protect, getMyRegisteredEvents);
router.post("/:id/register", protect, registerForEvent);
router.delete("/:id/register", protect, cancelRegistration);
router.get("/:id/register/status", protect, getMyRegistrationStatus);

export default router;