const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const problemCtrl = require("../controllers/codestage/problemController");
const submissionCtrl = require("../controllers/codestage/submissionController");

// All CodeStage routes require authentication
router.use(verifyToken);

// Problem routes
router.get("/problems", requireRole("student", "admin"), problemCtrl.getAllProblems);
router.get("/problems/:id/stats", requireRole("student", "admin"), problemCtrl.getProblemStats);
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
