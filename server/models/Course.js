const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    credits: { type: Number, required: true },
    semester: { type: Number, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
