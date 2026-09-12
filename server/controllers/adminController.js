import User from "../models/User.js";
import Society from "../models/Society.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import Attendance from "../models/Attendance.js";

// @desc  Get platform-wide overview stats
// @route GET /api/admin/overview
export const getOverview = async (req, res) => {
  try {
    const userCount = await User.countDocuments({ isDeleted: false });
    const societyCount = await Society.countDocuments({ isDeleted: false });
    const eventCount = await Event.countDocuments({ isDeleted: false });
    const registrationCount = await Registration.countDocuments({ status: "registered" });
    const attendanceCount = await Attendance.countDocuments();

    // Events per society (top 8, for a chart)
    const societies = await Society.find({ isDeleted: false }).limit(8);
    const eventsPerSociety = await Promise.all(
      societies.map(async (s) => {
        const count = await Event.countDocuments({ society: s._id, isDeleted: false });
        return { name: s.name, events: count };
      })
    );

    res.status(200).json({
      userCount,
      societyCount,
      eventCount,
      registrationCount,
      attendanceCount,
      eventsPerSociety,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all users (admin)
// @route GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false })
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all societies (admin)
// @route GET /api/admin/societies
export const getAllSocietiesAdmin = async (req, res) => {
  try {
    const societies = await Society.find({ isDeleted: false })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(societies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all events (admin)
// @route GET /api/admin/events
export const getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find({ isDeleted: false })
      .populate("society", "name")
      .sort({ startDateTime: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};