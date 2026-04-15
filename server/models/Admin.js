const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
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
    department: { type: String, default: "Administration" },
    designation: { type: String, default: "Administrator" },
    phone: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
