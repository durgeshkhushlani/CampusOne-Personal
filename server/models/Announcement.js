const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    targetAudience: {
      type: String,
      enum: ["all", "students", "faculty"],
      default: "all",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
