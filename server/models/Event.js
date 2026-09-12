import mongoose from "mongoose";
import { DEPARTMENTS } from "../constants/departments.js";

const eventSchema = new mongoose.Schema(
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
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
    department: {
      type: String,
      enum: DEPARTMENTS,
      required: true,
    },
    category: {
      type: String,
      trim: true,
    },
    banner: {
      type: String,
      default: "",
    },
    venue: {
      type: String,
      trim: true,
    },
    startDateTime: {
      type: Date,
      required: true,
    },
    endDateTime: {
      type: Date,
    },
    registrationDeadline: {
      type: Date,
    },
    capacity: {
      type: Number,
      default: null,
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

const Event = mongoose.model("Event", eventSchema);

export default Event;