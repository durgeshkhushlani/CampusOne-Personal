const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["midterm", "endterm", "quiz", "assignment"],
      required: true,
    },
    date: { type: Date, required: true },
    totalMarks: { type: Number, required: true },
    duration: { type: Number }, // minutes
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exam", examSchema);
