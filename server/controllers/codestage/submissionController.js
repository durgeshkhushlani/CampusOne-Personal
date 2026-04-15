const CodeSubmission = require("../../models/CodeSubmission");
const { evaluateRunCode, evaluateSubmission } = require("../../services/evaluationService");

// Queue disabled — using synchronous evaluation (no Redis required)
// To re-enable: uncomment the block below and remove the null assignment
let submissionQueue = null;
// try {
//   submissionQueue = require("../../queues/submission.queue");
// } catch (err) {
//   console.warn("BullMQ queue not available — submissions will be synchronous.");
// }

const createSubmission = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;

    const submission = await CodeSubmission.create({
      userId: req.user.userId,
      problemId,
      code,
      language,
      status: "Pending",
    });

    // Try queue-based evaluation first (requires Redis)
    if (submissionQueue) {
      try {
        await submissionQueue.add(
          "evaluate-submission",
          { submissionId: submission._id },
          {
            attempts: 3,
            backoff: { type: "exponential", delay: 3000 },
            removeOnComplete: true,
            removeOnFail: false,
          }
        );

        return res.status(201).json({
          message: "Submission queued successfully",
          submissionId: submission._id,
          status: "Pending",
        });
      } catch (queueErr) {
        console.warn("⚠️  Redis queue unavailable, falling back to synchronous evaluation.");
      }
    }

    // Fallback: evaluate synchronously when Redis/BullMQ is not available
    const result = await evaluateSubmission(submission);
    submission.status = result.status;
    submission.executionTime = result.executionTime;
    submission.memoryUsed = result.memoryUsed;
    submission.failedTestCase = result.failedTestCase || null;
    submission.output = result.message || result.output || null;
    await submission.save();

    return res.status(201).json({
      message: "Submission evaluated successfully",
      submissionId: submission._id,
      status: result.status,
    });
  } catch (error) {
    console.error("Submission Controller Error:", error);
    return res.status(500).json({ message: "Error creating submission", error: error.message });
  }
};

const getSubmissionHistory = async (req, res) => {
  try {
    const { problemId } = req.params;
    const submissions = await CodeSubmission.find({
      problemId,
      userId: req.user.userId,
    })
      .sort({ createdAt: -1 })
      .select("-code -__v");

    return res.status(200).json(submissions);
  } catch (error) {
    console.error("History Fetch Error:", error);
    return res.status(500).json({ message: "Error fetching submission history" });
  }
};

const getSubmissionById = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = await CodeSubmission.findById(submissionId).select("-code -__v");
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    res.status(200).json(submission);
  } catch (error) {
    res.status(500).json({ message: "Error fetching submission" });
  }
};

const runCode = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    const result = await evaluateRunCode(problemId, code, language);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Run Code Controller Error:", error);
    return res.status(500).json({ message: "Error running code", error: error.message });
  }
};

module.exports = { createSubmission, getSubmissionHistory, getSubmissionById, runCode };
