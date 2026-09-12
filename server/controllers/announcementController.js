import Announcement from "../models/Announcement.js";
import Membership from "../models/Membership.js";
import Society from "../models/Society.js";
import { DEPARTMENTS } from "../constants/departments.js";

// @desc  Get announcements relevant to the logged-in user
// @route GET /api/announcements
export const getAnnouncements = async (req, res) => {
  try {
    const user = req.user;

    const memberships = await Membership.find({ user: user._id, status: "approved" });
    const societyIds = memberships.map((m) => m.society);

    const filter = {
      isDeleted: false,
      $or: [
        { targetType: "everyone" },
        { targetType: "department", targetValue: user.department, department: user.department },
        { targetType: "semester", targetValue: String(user.semester), department: user.department },
        { targetType: "society", society: { $in: societyIds }, department: user.department },
      ],
    };

    const announcements = await Announcement.find(filter)
      .populate("createdBy", "name")
      .populate("society", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create an announcement
// @route POST /api/announcements
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, society, targetType, targetValue } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    let department = null;

    if (targetType === "society") {
      if (!society) {
        return res.status(400).json({ message: "Society is required for society-targeted announcements" });
      }
      const membership = await Membership.findOne({
        user: req.user._id,
        society,
        role: "admin",
        status: "approved",
      });
      if (!membership && req.user.role !== "universityAdmin") {
        return res.status(403).json({ message: "Not authorized to post for this society" });
      }
      const societyDoc = await Society.findOne({ _id: society, isDeleted: false });
      if (!societyDoc) {
        return res.status(404).json({ message: "Society not found" });
      }
      department = societyDoc.department;
    } else if (req.user.role !== "universityAdmin") {
      return res.status(403).json({ message: "Not authorized to post this type of announcement" });
    } else if (targetType === "department") {
      if (!targetValue || !DEPARTMENTS.includes(targetValue)) {
        return res.status(400).json({ message: `targetValue must be one of: ${DEPARTMENTS.join(", ")}` });
      }
      department = targetValue;
    } else if (targetType === "semester") {
      const { department: bodyDepartment } = req.body;
      if (!bodyDepartment || !DEPARTMENTS.includes(bodyDepartment)) {
        return res
          .status(400)
          .json({ message: `department is required for semester-targeted announcements and must be one of: ${DEPARTMENTS.join(", ")}` });
      }
      department = bodyDepartment;
    }
    // targetType === "everyone" -> department stays null (university-wide)

    const announcement = await Announcement.create({
      title,
      content,
      createdBy: req.user._id,
      society: targetType === "society" ? society : null,
      department,
      targetType: targetType || "everyone",
      targetValue: targetValue || null,
    });

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete an announcement
// @route DELETE /api/announcements/:id
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findOne({ _id: req.params.id, isDeleted: false });
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    const isOwner = announcement.createdBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "universityAdmin") {
      return res.status(403).json({ message: "Not authorized to delete this announcement" });
    }

    announcement.isDeleted = true;
    await announcement.save();

    res.status(200).json({ message: "Announcement deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};