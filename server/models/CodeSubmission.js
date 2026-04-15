const mongoose = require("mongoose");

const codeSubmissionSchema = new mongoose.Schema(
  {
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    code: { type: String, required: true },
    language: { type: String, required: true },
    executionTime: { type: String },
    memoryUsed: { type: Number },
    failedTestCase: { type: Number },
    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Wrong Answer",
        "Compilation Error",
        "Runtime Error",
        "Time Limit Exceeded",
        "Execution Error",
        "Error",
      ],
      default: "Pending",
    },
    output: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("CodeSubmission", codeSubmissionSchema);
