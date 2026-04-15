const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

enrollmentSchema.index({ classroomId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
