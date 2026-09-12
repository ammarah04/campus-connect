import Society from "../models/Society.js";
import Membership from "../models/Membership.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import Attendance from "../models/Attendance.js";
import { createNotification } from "../utils/createNotification.js";
import { DEPARTMENTS } from "../constants/departments.js";

// @desc  Get all societies (scoped to the requester's department, unless universityAdmin)
// @route GET /api/societies
export const getSocieties = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { isDeleted: false };
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };
    if (req.user.role !== "universityAdmin") filter.department = req.user.department;

    const societies = await Society.find(filter).sort({ createdAt: -1 });
    res.status(200).json(societies);
   } catch (error) {
    console.error("getSocieties error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get societies the logged-in user is a member of
// @route GET /api/societies/my/memberships
export const getMySocieties = async (req, res) => {
  try {
    const memberships = await Membership.find({
      user: req.user._id,
      status: "approved",
    }).populate({ path: "society", match: { isDeleted: false } });

    const results = memberships
      .filter((m) => m.society)
      .map((m) => ({ ...m.society.toObject(), myRole: m.role }));

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single society by ID (includes the requester's own membership status)
// @route GET /api/societies/:id
export const getSocietyById = async (req, res) => {
  try {
    const society = await Society.findOne({ _id: req.params.id, isDeleted: false });
    if (!society) {
      return res.status(404).json({ message: "Society not found" });
    }

    if (req.user.role !== "universityAdmin" && society.department !== req.user.department) {
      return res.status(404).json({ message: "Society not found" });
    }

    const memberCount = await Membership.countDocuments({
      society: society._id,
      status: "approved",
    });

    let myMembership = null;
    const membership = await Membership.findOne({
      user: req.user._id,
      society: society._id,
    });
    if (membership) {
      myMembership = {
        role: membership.role,
        status: membership.status,
        interviewScheduledAt: membership.interviewScheduledAt,
        interviewLocation: membership.interviewLocation,
      };
    }

    res.status(200).json({ ...society.toObject(), memberCount, myMembership });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create a new society (university admins only)
// @route POST /api/societies
export const createSociety = async (req, res) => {
  try {
    if (req.user.role !== "universityAdmin") {
      return res.status(403).json({ message: "Only university admins can create new societies" });
    }

    const { name, description, category, coverImage, department } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Society name is required" });
    }
    if (!department || !DEPARTMENTS.includes(department)) {
      return res.status(400).json({ message: `Department must be one of: ${DEPARTMENTS.join(", ")}` });
    }

    const society = await Society.create({
      name,
      description,
      category,
      coverImage,
      department,
      createdBy: req.user._id,
    });

    await Membership.create({
      user: req.user._id,
      society: society._id,
      role: "admin",
      status: "approved",
    });

    res.status(201).json(society);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update a society
// @route PUT /api/societies/:id
export const updateSociety = async (req, res) => {
  try {
    const society = await Society.findOne({ _id: req.params.id, isDeleted: false });
    if (!society) {
      return res.status(404).json({ message: "Society not found" });
    }

    const membership = await Membership.findOne({
      user: req.user._id,
      society: society._id,
      role: "admin",
      status: "approved",
    });

    if (!membership && req.user.role !== "universityAdmin") {
      return res.status(403).json({ message: "Not authorized to edit this society" });
    }

    const { name, description, category, coverImage, department } = req.body;
    if (name !== undefined) society.name = name;
    if (description !== undefined) society.description = description;
    if (category !== undefined) society.category = category;
    if (coverImage !== undefined) society.coverImage = coverImage;
    if (department !== undefined) {
      if (!DEPARTMENTS.includes(department)) {
        return res.status(400).json({ message: `Department must be one of: ${DEPARTMENTS.join(", ")}` });
      }
      society.department = department;
    }

    const updated = await society.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Soft-delete a society
// @route DELETE /api/societies/:id
export const deleteSociety = async (req, res) => {
  try {
    const society = await Society.findOne({ _id: req.params.id, isDeleted: false });
    if (!society) {
      return res.status(404).json({ message: "Society not found" });
    }

    const membership = await Membership.findOne({
      user: req.user._id,
      society: society._id,
      role: "admin",
      status: "approved",
    });

    if (!membership && req.user.role !== "universityAdmin") {
      return res.status(403).json({ message: "Not authorized to delete this society" });
    }

    society.isDeleted = true;
    await society.save();

    res.status(200).json({ message: "Society deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Apply to join a society (creates a pending membership, awaiting admin review)
// @route POST /api/societies/:id/join
export const joinSociety = async (req, res) => {
  try {
    const society = await Society.findOne({ _id: req.params.id, isDeleted: false });
    if (!society) {
      return res.status(404).json({ message: "Society not found" });
    }

    if (society.department !== req.user.department) {
      return res.status(403).json({ message: "You can only join societies in your own department" });
    }

    const existing = await Membership.findOne({ user: req.user._id, society: society._id });
    if (existing) {
      if (existing.status === "pending") {
        return res.status(400).json({ message: "Your application is already pending review" });
      }
      if (existing.status === "interviewScheduled") {
        return res.status(400).json({ message: "Your interview is already scheduled" });
      }
      if (existing.status === "approved") {
        return res.status(400).json({ message: "Already a member of this society" });
      }
      return res.status(400).json({ message: "You have already applied to this society" });
    }

    const membership = await Membership.create({
      user: req.user._id,
      society: society._id,
      role: "member",
      status: "pending",
    });

    const admins = await Membership.find({
      society: society._id,
      role: "admin",
      status: "approved",
    });

    for (const admin of admins) {
      await createNotification(
        {
          user: admin.user,
          message: `${req.user.name} applied to join ${society.name}`,
          type: "membership",
          link: `/societies/${society._id}/applicants`,
        },
        req.app
      );
    }

    res.status(201).json(membership);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already applied to this society" });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get pending / interview-scheduled applicants for a society (admin only)
// @route GET /api/societies/:id/applicants
export const getSocietyApplicants = async (req, res) => {
  try {
    const society = await Society.findOne({ _id: req.params.id, isDeleted: false });
    if (!society) {
      return res.status(404).json({ message: "Society not found" });
    }

    const membership = await Membership.findOne({
      user: req.user._id,
      society: society._id,
      role: "admin",
      status: "approved",
    });

    if (!membership && req.user.role !== "universityAdmin") {
      return res.status(403).json({ message: "Not authorized to view applicants for this society" });
    }

    const applicants = await Membership.find({
      society: society._id,
      status: { $in: ["pending", "interviewScheduled"] },
    })
      .populate("user", "name email department semester")
      .sort({ createdAt: 1 });

    res.status(200).json(applicants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Schedule an interview for a pending applicant
// @route PUT /api/societies/:id/applicants/:membershipId/interview
export const scheduleInterview = async (req, res) => {
  try {
    const { interviewScheduledAt, interviewLocation } = req.body;
    if (!interviewScheduledAt) {
      return res.status(400).json({ message: "interviewScheduledAt is required" });
    }

    const society = await Society.findOne({ _id: req.params.id, isDeleted: false });
    if (!society) {
      return res.status(404).json({ message: "Society not found" });
    }

    const adminMembership = await Membership.findOne({
      user: req.user._id,
      society: society._id,
      role: "admin",
      status: "approved",
    });

    if (!adminMembership && req.user.role !== "universityAdmin") {
      return res.status(403).json({ message: "Not authorized to schedule interviews for this society" });
    }

    const applicant = await Membership.findOne({
      _id: req.params.membershipId,
      society: society._id,
      status: "pending",
    });

    if (!applicant) {
      return res.status(404).json({ message: "Pending application not found" });
    }

    applicant.status = "interviewScheduled";
    applicant.interviewScheduledAt = interviewScheduledAt;
    applicant.interviewLocation = interviewLocation || null;
    await applicant.save();

    await createNotification(
      {
        user: applicant.user,
        message: `Your interview for ${society.name} has been scheduled`,
        type: "membership",
        link: `/societies/${society._id}`,
      },
      req.app
    );

    res.status(200).json(applicant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Approve or reject an applicant (only after their interview time has passed)
// @route PUT /api/societies/:id/applicants/:membershipId
export const respondToApplication = async (req, res) => {
  try {
    const { action } = req.body;
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "action must be 'approve' or 'reject'" });
    }

    const society = await Society.findOne({ _id: req.params.id, isDeleted: false });
    if (!society) {
      return res.status(404).json({ message: "Society not found" });
    }

    const adminMembership = await Membership.findOne({
      user: req.user._id,
      society: society._id,
      role: "admin",
      status: "approved",
    });

    if (!adminMembership && req.user.role !== "universityAdmin") {
      return res.status(403).json({ message: "Not authorized to review applicants for this society" });
    }

    const applicant = await Membership.findOne({
      _id: req.params.membershipId,
      society: society._id,
      status: "interviewScheduled",
    });

    if (!applicant) {
      return res
        .status(404)
        .json({ message: "No interview-scheduled application found. Schedule an interview before deciding." });
    }

    if (new Date() < applicant.interviewScheduledAt) {
      return res.status(400).json({ message: "Cannot decide before the scheduled interview time has passed" });
    }

    if (action === "approve") {
      applicant.status = "approved";
      applicant.interviewScheduledAt = null;
      applicant.interviewLocation = null;
      await applicant.save();

      await createNotification(
        {
          user: applicant.user,
          message: `You've been selected to join ${society.name}!`,
          type: "membership",
          link: `/societies/${society._id}`,
        },
        req.app
      );
    } else {
      await Membership.deleteOne({ _id: applicant._id });

      await createNotification(
        {
          user: applicant.user,
          message: `Your application to ${society.name} was not approved`,
          type: "membership",
          link: `/societies/${society._id}`,
        },
        req.app
      );
    }

    res.status(200).json({ message: `Application ${action}d` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Leave a society
// @route DELETE /api/societies/:id/join
export const leaveSociety = async (req, res) => {
  try {
    const membership = await Membership.findOne({
      user: req.user._id,
      society: req.params.id,
    });

    if (!membership) {
      return res.status(404).json({ message: "You are not a member of this society" });
    }

    if (membership.role === "admin") {
      return res.status(400).json({
        message: "Society admins cannot leave directly. Contact a university admin.",
      });
    }

    await Membership.deleteOne({ _id: membership._id });
    res.status(200).json({ message: "Left society" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get analytics for a society (admin only)
// @route GET /api/societies/:id/analytics
export const getSocietyAnalytics = async (req, res) => {
  try {
    const society = await Society.findOne({ _id: req.params.id, isDeleted: false });
    if (!society) {
      return res.status(404).json({ message: "Society not found" });
    }

    const membership = await Membership.findOne({
      user: req.user._id,
      society: society._id,
      role: "admin",
      status: "approved",
    });

    if (!membership && req.user.role !== "universityAdmin") {
      return res.status(403).json({ message: "Not authorized to view analytics for this society" });
    }

    const memberCount = await Membership.countDocuments({
      society: society._id,
      status: "approved",
    });

    const events = await Event.find({ society: society._id, isDeleted: false }).sort({ startDateTime: 1 });

    const perEventStats = await Promise.all(
      events.map(async (event) => {
        const registrations = await Registration.countDocuments({ event: event._id, status: "registered" });
        const attendance = await Attendance.countDocuments({ event: event._id });
        return { eventId: event._id, title: event.title, registrations, attendance };
      })
    );

    const totalRegistrations = perEventStats.reduce((sum, e) => sum + e.registrations, 0);
    const totalAttendance = perEventStats.reduce((sum, e) => sum + e.attendance, 0);

    res.status(200).json({
      society: { id: society._id, name: society.name },
      memberCount,
      eventCount: events.length,
      totalRegistrations,
      totalAttendance,
      perEventStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};