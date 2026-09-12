import mongoose from "mongoose";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import crypto from "crypto";
import { createNotification } from "../utils/createNotification.js";

// @desc  Register for an event
// @route POST /api/events/:id/register
export const registerForEvent = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const event = await Event.findOne({ _id: req.params.id, isDeleted: false }).session(session);
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Registration is closed for this event" });
    }

    const existing = await Registration.findOne({
      user: req.user._id,
      event: event._id,
    }).session(session);

    if (existing && existing.status !== "cancelled") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Already registered for this event" });
    }

    let status = "registered";
    if (event.capacity !== null && event.capacity !== undefined) {
      const currentCount = await Registration.countDocuments({
        event: event._id,
        status: "registered",
      }).session(session);

      if (currentCount >= event.capacity) {
        status = "waitlisted";
      }
    }

    const qrToken = crypto.randomBytes(16).toString("hex");

    let registration;
    if (existing) {
      existing.status = status;
      existing.qrToken = qrToken;
      registration = await existing.save({ session });
    } else {
      const created = await Registration.create(
        [
          {
            user: req.user._id,
            event: event._id,
            status,
            qrToken,
          },
        ],
        { session }
      );
      registration = created[0];
    }

    await session.commitTransaction();
    res.status(201).json(registration);
  } catch (error) {
    await session.abortTransaction();
    if (error.code === 11000) {
      return res.status(400).json({ message: "Already registered for this event" });
    }
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// @desc  Cancel registration (with automatic waitlist promotion)
// @route DELETE /api/events/:id/register
export const cancelRegistration = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const registration = await Registration.findOne({
      user: req.user._id,
      event: req.params.id,
    }).session(session);

    if (!registration || registration.status === "cancelled") {
      await session.abortTransaction();
      return res.status(404).json({ message: "Registration not found" });
    }

    const wasRegistered = registration.status === "registered";
    registration.status = "cancelled";
    await registration.save({ session });

    let promoted = null;

    // If a confirmed spot just opened up, promote the earliest waitlisted person
    if (wasRegistered) {
      const nextInLine = await Registration.findOne({
        event: req.params.id,
        status: "waitlisted",
      })
        .sort({ createdAt: 1 })
        .session(session);

      if (nextInLine) {
        nextInLine.status = "registered";
        nextInLine.qrToken = crypto.randomBytes(16).toString("hex");
        await nextInLine.save({ session });
        promoted = nextInLine;
      }
    }

    await session.commitTransaction();

    // Notify the promoted user (outside the transaction, since it's not critical to atomicity)
    if (promoted) {
      const event = await Event.findById(req.params.id);
      await createNotification(
        {
          user: promoted.user,
          message: `You've been moved off the waitlist and confirmed for "${event.title}"!`,
          type: "event",
          link: `/events/${req.params.id}`,
        },
        req.app
      );
    }

    res.status(200).json({ message: "Registration cancelled" });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// @desc  Get my registration status for an event
// @route GET /api/events/:id/register/status
export const getMyRegistrationStatus = async (req, res) => {
  try {
    const registration = await Registration.findOne({
      user: req.user._id,
      event: req.params.id,
    });

    if (!registration) {
      return res.status(200).json({ status: "not_registered" });
    }

    res.status(200).json({
      status: registration.status,
      qrToken: registration.qrToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all events the logged-in user is registered/waitlisted for
// @route GET /api/events/my/registrations
export const getMyRegisteredEvents = async (req, res) => {
  try {
    const registrations = await Registration.find({
      user: req.user._id,
      status: { $in: ["registered", "waitlisted"] },
    })
      .populate({
        path: "event",
        match: { isDeleted: false },
        populate: { path: "society", select: "name" },
      })
      .sort({ createdAt: -1 });

    const results = registrations
      .filter((r) => r.event)
      .map((r) => ({
        ...r.event.toObject(),
        registrationStatus: r.status,
      }));

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};