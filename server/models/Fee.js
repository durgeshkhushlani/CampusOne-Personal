const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    semester: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ["paid", "partial", "unpaid", "overdue"],
      default: "unpaid",
    },
    paidDate: { type: Date },
    transactionId: { type: String },
    description: { type: String, default: "Tuition Fee" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fee", feeSchema);
