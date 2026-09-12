import Event from "../models/Event.js";
import Society from "../models/Society.js";
import Membership from "../models/Membership.js";
import Registration from "../models/Registration.js";

// @desc  Get all events (with optional filters, scoped to requester's department)
// @route GET /api/events
export const getEvents = async (req, res) => {
  try {
    const { category, society, upcoming, search, limit } = req.query;
    const filter = { isDeleted: false };

    if (category) filter.category = category;
    if (society) filter.society = society;
    if (search) filter.title = { $regex: search, $options: "i" };
    if (upcoming === "true") filter.startDateTime = { $gte: new Date() };
    if (req.user.role !== "universityAdmin") filter.department = req.user.department;

    let query = Event.find(filter).populate("society", "name").sort({ startDateTime: 1 });
    if (limit) query = query.limit(Number(limit));

    const events = await query;
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get personalized event recommendations based on user's interests
// @route GET /api/events/recommended
export const getRecommendedEvents = async (req, res) => {
  try {
    const interests = req.user.interests || [];

    if (interests.length === 0) {
      return res.status(200).json([]);
    }

    const myRegistrations = await Registration.find({
      user: req.user._id,
      status: { $in: ["registered", "waitlisted"] },
    }).select("event");
    const excludedEventIds = myRegistrations.map((r) => r.event);

    const interestPattern = interests.map((i) => i.trim()).filter(Boolean).join("|");

    const filter = {
      isDeleted: false,
      startDateTime: { $gte: new Date() },
      _id: { $nin: excludedEventIds },
      $or: [
        { category: { $regex: interestPattern, $options: "i" } },
        { title: { $regex: interestPattern, $options: "i" } },
        { description: { $regex: interestPattern, $options: "i" } },
      ],
    };
    if (req.user.role !== "universityAdmin") filter.department = req.user.department;

    const events = await Event.find(filter)
      .populate("society", "name")
      .sort({ startDateTime: 1 })
      .limit(6);

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single event
// @route GET /api/events/:id
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, isDeleted: false }).populate(
      "society",
      "name"
    );
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (req.user.role !== "universityAdmin" && event.department !== req.user.department) {
      return res.status(404).json({ message: "Event not found" });
    }

    const registrationCount = await Registration.countDocuments({
      event: event._id,
      status: "registered",
    });

    res.status(200).json({ ...event.toObject(), registrationCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const isSocietyAdmin = async (userId, societyId) => {
  const membership = await Membership.findOne({
    user: userId,
    society: societyId,
    role: "admin",
    status: "approved",
  });
  return !!membership;
};

// @desc  Create event (department is inherited from the event's society)
// @route POST /api/events
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      society,
      category,
      banner,
      venue,
      startDateTime,
      endDateTime,
      registrationDeadline,
      capacity,
    } = req.body;

    if (!title || !society || !startDateTime) {
      return res.status(400).json({ message: "Title, society, and start date are required" });
    }

    const societyDoc = await Society.findOne({ _id: society, isDeleted: false });
    if (!societyDoc) {
      return res.status(404).json({ message: "Society not found" });
    }

    const authorized = await isSocietyAdmin(req.user._id, society);
    if (!authorized && req.user.role !== "universityAdmin") {
      return res.status(403).json({ message: "Not authorized to create events for this society" });
    }

    const event = await Event.create({
      title,
      description,
      society,
      department: societyDoc.department,
      category,
      banner,
      venue,
      startDateTime,
      endDateTime,
      registrationDeadline,
      capacity,
      createdBy: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update event
// @route PUT /api/events/:id
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, isDeleted: false });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const authorized = await isSocietyAdmin(req.user._id, event.society);
    if (!authorized && req.user.role !== "universityAdmin") {
      return res.status(403).json({ message: "Not authorized to edit this event" });
    }

    const fields = [
      "title",
      "description",
      "category",
      "banner",
      "venue",
      "startDateTime",
      "endDateTime",
      "registrationDeadline",
      "capacity",
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) event[field] = req.body[field];
    });

    const updated = await event.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete event (soft delete)
// @route DELETE /api/events/:id
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, isDeleted: false });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const authorized = await isSocietyAdmin(req.user._id, event.society);
    if (!authorized && req.user.role !== "universityAdmin") {
      return res.status(403).json({ message: "Not authorized to delete this event" });
    }

    event.isDeleted = true;
    await event.save();

    res.status(200).json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};