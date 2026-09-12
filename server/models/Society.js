import mongoose from "mongoose";
import { DEPARTMENTS } from "../constants/departments.js";

const societySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
      default: "",
    },
    department: {
      type: String,
      enum: DEPARTMENTS,
      required: true,
    },
    createdBy: {
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

const Society = mongoose.model("Society", societySchema);

export default Society;