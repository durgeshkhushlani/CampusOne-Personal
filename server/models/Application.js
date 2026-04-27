const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    answers: [
      {
        question: String,
        answer: String,
      },
    ],
    resume: {
      type: String,
      required: [true, "Resume is required"],
    },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected", "selected"],
      default: "applied",
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ studentId: 1, companyId: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
