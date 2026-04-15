const Problem = require("../../models/Problem");
const CodeSubmission = require("../../models/CodeSubmission");

const createProblem = async (req, res) => {
  try {
    const problem = await Problem.create(req.body);
    res.status(201).json(problem);
  } catch (error) {
    console.error("Create problem error:", error);
    res.status(500).json({ message: "Error creating problem" });
  }
};

const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!problem) return res.status(404).json({ message: "Problem not found" });
    res.json(problem);
  } catch (error) {
    console.error("Update problem error:", error);
    res.status(500).json({ message: "Error updating problem" });
  }
};

const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    // Also remove all submissions for this problem
    await CodeSubmission.deleteMany({ problemId: req.params.id });
    await problem.deleteOne();

    res.json({ message: "Problem deleted successfully" });
  } catch (error) {
    console.error("Delete problem error:", error);
    res.status(500).json({ message: "Error deleting problem" });
  }
};

const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find().select("title difficulty tags");

    let solvedProblemIds = new Set();
    if (req.user) {
      const acceptedSubmissions = await CodeSubmission.find({
        userId: req.user.userId,
        status: "Accepted",
      }).select("problemId");
      solvedProblemIds = new Set(acceptedSubmissions.map((s) => s.problemId.toString()));
    }

    const problemsWithSolved = problems.map((p) => ({
      ...p.toObject(),
      isSolved: solvedProblemIds.has(p._id.toString()),
    }));

    res.status(200).json(problemsWithSolved);
  } catch (error) {
    console.error("Fetch Problems Error:", error);
    res.status(500).json({ message: "Error fetching problems" });
  }
};

const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    // Admin gets ALL test cases (including hidden), students get only visible ones
    if (req.user.role === "admin") {
      return res.json(problem);
    }

    const visibleTestCases = problem.testCases
      .filter((tc) => !tc.isHidden)
      .map((tc) => ({ input: tc.input, output: tc.output }));

    res.json({ ...problem.toObject(), testCases: visibleTestCases });
  } catch (error) {
    res.status(500).json({ message: "Error fetching problem" });
  }
};

const getProblemStats = async (req, res) => {
  try {
    const { id } = req.params;
    const totalSubmissions = await CodeSubmission.countDocuments({ problemId: id });
    const acceptedSubmissions = await CodeSubmission.countDocuments({ problemId: id, status: "Accepted" });
    const acceptanceRate = totalSubmissions === 0 ? 0 : ((acceptedSubmissions / totalSubmissions) * 100).toFixed(2);

    return res.status(200).json({
      totalSubmissions,
      acceptedSubmissions,
      acceptanceRate: `${acceptanceRate}%`,
    });
  } catch (error) {
    console.error("Problem Stats Error:", error);
    return res.status(500).json({ message: "Error fetching problem stats" });
  }
};

module.exports = { getAllProblems, getProblemById, createProblem, updateProblem, deleteProblem, getProblemStats };
