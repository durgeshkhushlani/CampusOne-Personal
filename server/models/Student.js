const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    enrollmentNo: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    program: { type: String, required: true },
    semester: { type: Number, default: 1 },
    batch: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    phone: { type: String },
    address: { type: String },
    guardianName: { type: String },
    guardianPhone: { type: String },
    bloodGroup: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
