import Notification from "../models/Notification.js";

export const createNotification = async ({ user, message, type = "general", link = null }, app) => {
  try {
    const notification = await Notification.create({ user, message, type, link });

    // Emit real-time event if the user is currently connected
    if (app) {
      const io = app.get("io");
      const userSocketMap = app.get("userSocketMap");
      const socketId = userSocketMap.get(user.toString());

      if (socketId) {
        io.to(socketId).emit("newNotification", notification);
      }
    }

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error.message);
  }
};