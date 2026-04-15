const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    employeeId: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    designation: { type: String },
    qualification: { type: String },
    specialization: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    phone: { type: String },
    address: { type: String },
    joiningDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Faculty", facultySchema);
