import express from "express";
import { generateCertificate } from "../controllers/certificateController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:eventId", protect, generateCertificate);

export default router;