const mongoose = require("mongoose");

const THEME_COLORS = [
  "#1967d2", "#1e8e3e", "#e8710a", "#d93025",
  "#9334e6", "#185abc", "#137333", "#b06000",
];

const classroomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    section: { type: String },
    subject: { type: String },
    description: { type: String },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    code: { type: String, unique: true, required: true },
    themeColor: { type: String, default: "#1967d2" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Classroom", classroomSchema);
module.exports.THEME_COLORS = THEME_COLORS;
