const mongoose = require("mongoose");

const studentCourseSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ["enrolled", "completed", "dropped"],
      default: "enrolled",
    },
    grade: { type: String },
  },
  { timestamps: true }
);

studentCourseSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("StudentCourse", studentCourseSchema);
