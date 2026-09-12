import mongoose from "mongoose";
import { DEPARTMENTS } from "../constants/departments.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    universityId: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      enum: DEPARTMENTS,
      required: true,
    },
    semester: {
      type: Number,
    },
    interests: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    profileImage: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["student", "societyAdmin", "universityAdmin"],
      default: "student",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;