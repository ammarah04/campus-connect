import ChatMessage from "../models/ChatMessage.js";
import Registration from "../models/Registration.js";
import Event from "../models/Event.js";

// @desc  Get chat history for an event
// @route GET /api/chat/:eventId
export const getChatHistory = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.eventId, isDeleted: false });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Only registered attendees (or waitlisted) can view/join the chat
    const registration = await Registration.findOne({
      user: req.user._id,
      event: event._id,
      status: { $in: ["registered", "waitlisted"] },
    });

    if (!registration) {
      return res.status(403).json({ message: "You must be registered for this event to view its chat" });
    }

    const messages = await ChatMessage.find({ event: req.params.eventId })
      .populate("sender", "name")
      .sort({ createdAt: 1 })
      .limit(100);

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};