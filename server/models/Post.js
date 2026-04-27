const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String },
    type: {
      type: String,
      enum: ["material", "assignment", "announcement"],
      required: true,
    },
    fileUrl: { type: String },
    fileName: { type: String },
    dueDate: { type: Date },
    totalPoints: { type: Number, default: 100 },
    topic: { type: String, default: "General" },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
