import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
    role: {
      type: String,
      enum: ["member", "admin"],
      default: "member",
    },
    status: {
      type: String,
      enum: ["pending", "interviewScheduled", "approved", "rejected"],
      default: "approved",
    },
    interviewScheduledAt: {
      type: Date,
      default: null,
    },
    interviewLocation: {
      type: String, // room name, or a call link
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent duplicate memberships for the same user + society
membershipSchema.index({ user: 1, society: 1 }, { unique: true });

const Membership = mongoose.model("Membership", membershipSchema);

export default Membership;