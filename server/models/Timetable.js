const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String },
    type: {
      type: String,
      enum: ["lecture", "lab", "tutorial"],
      default: "lecture",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Timetable", timetableSchema);
