import Registration from "../models/Registration.js";
import Attendance from "../models/Attendance.js";
import Membership from "../models/Membership.js";
import Event from "../models/Event.js";

// @desc  Check in an attendee by QR token
// @route POST /api/attendance/check-in
export const checkIn = async (req, res) => {
  try {
    const { qrToken } = req.body;

    if (!qrToken) {
      return res.status(400).json({ message: "QR token is required" });
    }

    const registration = await Registration.findOne({ qrToken }).populate("event");

    if (!registration) {
      return res.status(404).json({ message: "Invalid QR code" });
    }

    if (registration.status === "cancelled") {
      return res.status(400).json({ message: "This registration was cancelled" });
    }

    const event = registration.event;

    const membership = await Membership.findOne({
      user: req.user._id,
      society: event.society,
      role: "admin",
      status: "approved",
    });

    if (!membership && req.user.role !== "universityAdmin") {
      return res.status(403).json({ message: "Not authorized to check in attendees for this event" });
    }

    const alreadyCheckedIn = await Attendance.findOne({
      user: registration.user,
      event: event._id,
    });

    if (alreadyCheckedIn) {
      return res.status(400).json({ message: "This attendee has already been checked in" });
    }

    const attendance = await Attendance.create({
      user: registration.user,
      event: event._id,
      registration: registration._id,
      checkedInBy: req.user._id,
    });

    res.status(201).json({ message: "Checked in successfully", attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get attendance list for an event
// @route GET /api/attendance/event/:eventId
export const getEventAttendance = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.eventId, isDeleted: false });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const membership = await Membership.findOne({
      user: req.user._id,
      society: event.society,
      role: "admin",
      status: "approved",
    });

    if (!membership && req.user.role !== "universityAdmin") {
      return res.status(403).json({ message: "Not authorized to view attendance for this event" });
    }

    const attendance = await Attendance.find({ event: req.params.eventId })
      .populate("user", "name email universityId")
      .sort({ checkedInAt: -1 });

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get my attendance history
// @route GET /api/attendance/my
export const getMyAttendanceHistory = async (req, res) => {
  try {
    const attendance = await Attendance.find({ user: req.user._id })
      .populate("event", "title startDateTime venue")
      .sort({ checkedInAt: -1 });

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};