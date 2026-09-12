import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import societyRoutes from "./routes/societyRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import studyResourceRoutes from "./routes/studyResourceRoutes.js";
import ChatMessage from "./models/ChatMessage.js";
import Registration from "./models/Registration.js";

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

const userSocketMap = new Map();

io.on("connection", (socket) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    socket.disconnect();
    return;
  }

  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
    userSocketMap.set(userId, socket.id);
    console.log(`Socket connected for user ${userId}`);
  } catch (error) {
    socket.disconnect();
    return;
  }

  // --- Event chat rooms ---
  socket.on("joinEventChat", async (eventId) => {
    try {
      const registration = await Registration.findOne({
        user: userId,
        event: eventId,
        status: { $in: ["registered", "waitlisted"] },
      });

      if (!registration) {
        socket.emit("chatError", "You must be registered for this event to join its chat");
        return;
      }

      socket.join(`event-${eventId}`);
    } catch (error) {
      socket.emit("chatError", "Failed to join chat");
    }
  });

  socket.on("leaveEventChat", (eventId) => {
    socket.leave(`event-${eventId}`);
  });

  socket.on("sendChatMessage", async ({ eventId, content }) => {
    try {
      if (!content || !content.trim()) return;

      const registration = await Registration.findOne({
        user: userId,
        event: eventId,
        status: { $in: ["registered", "waitlisted"] },
      });

      if (!registration) {
        socket.emit("chatError", "You must be registered for this event to chat");
        return;
      }

      const message = await ChatMessage.create({
        event: eventId,
        sender: userId,
        content: content.trim(),
      });

      const populated = await message.populate("sender", "name");

      io.to(`event-${eventId}`).emit("newChatMessage", populated);
    } catch (error) {
      socket.emit("chatError", "Failed to send message");
    }
  });

  socket.on("disconnect", () => {
    userSocketMap.delete(userId);
  });
});

app.set("io", io);
app.set("userSocketMap", userSocketMap);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "CampusConnect API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/societies", societyRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/events", registrationRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/study-resources", studyResourceRoutes);

app.use((err, req, res, next) => {
  console.log("GLOBAL ERROR HANDLER:", err.message);
  console.log("STACK:", err.stack);
  res.status(500).json({ message: err.message || "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});