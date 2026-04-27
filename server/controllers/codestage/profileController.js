const CodeSubmission = require("../../models/CodeSubmission");
const Problem = require("../../models/Problem");
const User = require("../../models/User");
const CodeComment = require("../../models/CodeComment");

// GET /api/codestage/profile/me — Student profile stats
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Total problem counts by difficulty
    const [totalEasy, totalMedium, totalHard] = await Promise.all([
      Problem.countDocuments({ difficulty: "easy" }),
      Problem.countDocuments({ difficulty: "medium" }),
      Problem.countDocuments({ difficulty: "hard" }),
    ]);

    // Distinct accepted problem IDs for this user
    const acceptedSubmissions = await CodeSubmission.find({
      userId,
      status: "Accepted",
    }).select("problemId");

    const solvedProblemIds = [...new Set(acceptedSubmissions.map((s) => s.problemId.toString()))];
    const totalSolved = solvedProblemIds.length;

    // Breakdown by difficulty
    let easySolved = 0, mediumSolved = 0, hardSolved = 0;
    if (solvedProblemIds.length > 0) {
      const solvedProblems = await Problem.find({ _id: { $in: solvedProblemIds } }).select("difficulty");
      solvedProblems.forEach((p) => {
        if (p.difficulty === "easy") easySolved++;
        else if (p.difficulty === "medium") mediumSolved++;
        else if (p.difficulty === "hard") hardSolved++;
      });
    }

    // Recent 10 submissions
    const recentSubmissions = await CodeSubmission.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("problemId", "title difficulty")
      .select("-code -__v");

    res.json({
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      totalEasy,
      totalMedium,
      totalHard,
      recentSubmissions,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/codestage/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const results = await CodeSubmission.aggregate([
      { $match: { status: "Accepted" } },
      { $group: { _id: { userId: "$userId", problemId: "$problemId" } } },
      { $group: { _id: "$_id.userId", solvedCount: { $sum: 1 } } },
      { $sort: { solvedCount: -1 } },
      { $limit: 20 },
    ]);

    // Populate user names
    const leaderboard = await Promise.all(
      results.map(async (entry, idx) => {
        const user = await User.findById(entry._id).select("name");
        return {
          rank: idx + 1,
          userId: entry._id,
          name: user?.name || "Unknown",
          solvedCount: entry.solvedCount,
        };
      })
    );

    res.json(leaderboard);
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/codestage/problems/:id/comments
const getComments = async (req, res) => {
  try {
    const comments = await CodeComment.find({ problemId: req.params.id })
      .populate("userId", "name role")
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/codestage/problems/:id/comments
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ message: "Comment cannot be empty" });

    const comment = await CodeComment.create({
      problemId: req.params.id,
      userId: req.user.userId,
      content: content.trim(),
    });
    const populated = await CodeComment.findById(comment._id).populate("userId", "name role");
    res.status(201).json(populated);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getProfile, getLeaderboard, getComments, addComment };
