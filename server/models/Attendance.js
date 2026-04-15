const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["present", "absent", "late"],
      required: true,
    },
    weekNumber: { type: Number },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
