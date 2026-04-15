const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true, default: "" },
  output: { type: String, required: true, default: "" },
  isHidden: { type: Boolean, default: false },
});

// Override required check for empty string
mongoose.Schema.Types.String.checkRequired((v) => v !== null && v !== undefined);

const problemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    description: { type: String, required: true },
    constraints: { type: String, default: "" },
    tags: [{ type: String }],
    sampleInput: { type: String, default: "" },
    sampleOutput: { type: String, default: "" },
    testCases: {
      type: [testCaseSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: "At least one test case is required",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Problem", problemSchema);
