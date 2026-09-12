import express from "express";
import {
  getSocieties,
  getMySocieties,
  getSocietyById,
  createSociety,
  updateSociety,
  deleteSociety,
  joinSociety,
  leaveSociety,
  getSocietyApplicants,
  scheduleInterview,
  respondToApplication,
  getSocietyAnalytics,
} from "../controllers/societyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getSocieties);
router.get("/my/memberships", protect, getMySocieties);
router.get("/:id", protect, getSocietyById);
router.get("/:id/analytics", protect, getSocietyAnalytics);
router.get("/:id/applicants", protect, getSocietyApplicants);
router.post("/", protect, createSociety);
router.put("/:id", protect, updateSociety);
router.delete("/:id", protect, deleteSociety);
router.post("/:id/join", protect, joinSociety);
router.delete("/:id/join", protect, leaveSociety);
router.put("/:id/applicants/:membershipId/interview", protect, scheduleInterview);
router.put("/:id/applicants/:membershipId", protect, respondToApplication);

export default router;