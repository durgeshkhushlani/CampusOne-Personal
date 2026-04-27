const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const problemCtrl = require("../controllers/codestage/problemController");
const submissionCtrl = require("../controllers/codestage/submissionController");
const profileCtrl = require("../controllers/codestage/profileController");

// All CodeStage routes require authentication
router.use(verifyToken);

// Profile & Leaderboard (placed before :id routes to avoid conflicts)
router.get("/profile/me", requireRole("student", "admin"), profileCtrl.getProfile);
router.get("/leaderboard", requireRole("student", "admin"), profileCtrl.getLeaderboard);

// Problem routes
router.get("/problems", requireRole("student", "admin"), problemCtrl.getAllProblems);
router.get("/problems/:id/stats", requireRole("student", "admin"), problemCtrl.getProblemStats);
router.get("/problems/:id/comments", requireRole("student", "admin"), profileCtrl.getComments);
router.post("/problems/:id/comments", requireRole("student", "admin"), profileCtrl.addComment);
router.get("/problems/:id", requireRole("student", "admin"), problemCtrl.getProblemById);
router.post("/problems", requireRole("admin"), problemCtrl.createProblem);
router.put("/problems/:id", requireRole("admin"), problemCtrl.updateProblem);
router.delete("/problems/:id", requireRole("admin"), problemCtrl.deleteProblem);

// Submission routes
router.post("/submissions", requireRole("student"), submissionCtrl.createSubmission);
router.post("/submissions/run", requireRole("student"), submissionCtrl.runCode);
router.get("/submissions/history/:problemId", requireRole("student"), submissionCtrl.getSubmissionHistory);
router.get("/submissions/:submissionId", requireRole("student"), submissionCtrl.getSubmissionById);

module.exports = router;
