const mongoose = require("mongoose");

const classroomSubmissionSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileUrl: { type: String, required: true },
    fileName: { type: String },
    grade: { type: Number },
    status: {
      type: String,
      enum: ["submitted", "graded", "returned"],
      default: "submitted",
    },
    isLate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClassroomSubmission", classroomSubmissionSchema);
