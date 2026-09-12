import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Society from "../models/Society.js";
import Event from "../models/Event.js";
import Announcement from "../models/Announcement.js";
import Post from "../models/Post.js";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Backfilling department = 'AI' on existing records...");

  const userResult = await User.updateMany({}, { $set: { department: "AI" } });
  const societyResult = await Society.updateMany({}, { $set: { department: "AI" } });
  const eventResult = await Event.updateMany({}, { $set: { department: "AI" } });
  const announcementResult = await Announcement.updateMany({}, { $set: { department: "AI" } });
  const postResult = await Post.updateMany({}, { $set: { department: "AI" } });

  console.log(`Users updated: ${userResult.modifiedCount}`);
  console.log(`Societies updated: ${societyResult.modifiedCount}`);
  console.log(`Events updated: ${eventResult.modifiedCount}`);
  console.log(`Announcements updated: ${announcementResult.modifiedCount}`);
  console.log(`Posts updated: ${postResult.modifiedCount}`);

  await mongoose.disconnect();
  console.log("Done.");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});