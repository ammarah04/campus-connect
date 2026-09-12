import mongoose from "mongoose";
import { DEPARTMENTS } from "../constants/departments.js";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      default: null,
    },
    department: {
      type: String,
      enum: DEPARTMENTS,
      default: null, // null = university-wide ("everyone" announcements only)
    },
    targetType: {
      type: String,
      enum: ["everyone", "department", "society", "semester"],
      default: "everyone",
    },
    targetValue: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;