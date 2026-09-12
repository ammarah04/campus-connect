import mongoose from "mongoose";
import { DEPARTMENTS } from "../constants/departments.js";

const RESOURCE_TYPES = ["Notes", "Past Paper", "Quiz Prep", "Assignment Help"];

const studyResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    courseCode: {
      type: String,
      trim: true,
    },
    resourceType: {
      type: String,
      enum: RESOURCE_TYPES,
      required: true,
    },
    department: {
      type: String,
      enum: DEPARTMENTS,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const RESOURCE_TYPE_LIST = RESOURCE_TYPES;

const StudyResource = mongoose.model("StudyResource", studyResourceSchema);

export default StudyResource;