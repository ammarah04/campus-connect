import express from "express";
import {
  getStudyResources,
  getStudyResourceById,
  uploadStudyResource,
  deleteStudyResource,
} from "../controllers/studyResourceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.get("/", protect, getStudyResources);
router.get("/:id", protect, getStudyResourceById);
router.post("/", protect, upload.single("file"), uploadStudyResource);
router.delete("/:id", protect, deleteStudyResource);

export default router;