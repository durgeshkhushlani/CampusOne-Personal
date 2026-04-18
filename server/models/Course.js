const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    credits: { type: Number, required: true },
    semester: { type: Number, required: true },
    description: { type: String },
    programObjective: { type: String, default: "To provide students with foundational knowledge and practical skills in the subject domain." },
    syllabus: { type: [String], default: ["Unit 1: Introduction", "Unit 2: Core Concepts", "Unit 3: Advanced Topics", "Unit 4: Case Studies"] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
