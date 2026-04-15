const mongoose = require("mongoose");

const examResultSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    marksObtained: { type: Number, required: true },
    grade: { type: String },
    remarks: { type: String },
  },
  { timestamps: true }
);

examResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("ExamResult", examResultSchema);
