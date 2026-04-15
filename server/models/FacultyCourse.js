const mongoose = require("mongoose");

const facultyCourseSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
  },
  { timestamps: true }
);

facultyCourseSchema.index({ facultyId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("FacultyCourse", facultyCourseSchema);
