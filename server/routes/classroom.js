const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { verifyToken, requireRole } = require("../middleware/auth");
const classroomCtrl = require("../controllers/classroom/classroomController");
const postCtrl = require("../controllers/classroom/postController");

// Multer for file uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// All classroom routes require authentication
router.use(verifyToken);

// ========================
// Classroom Routes
// ========================
router.post("/classrooms", requireRole("faculty", "admin"), classroomCtrl.createClassroom);
router.post("/classrooms/join", requireRole("student"), classroomCtrl.joinClassroom);
router.get("/classrooms", requireRole("student", "faculty", "admin"), classroomCtrl.listClassrooms);
router.get("/classrooms/:id", requireRole("student", "faculty", "admin"), classroomCtrl.getClassroom);
router.get("/classrooms/:id/people", requireRole("student", "faculty", "admin"), classroomCtrl.getPeople);
router.delete("/classrooms/:id", requireRole("admin"), classroomCtrl.deleteClassroom);

// ========================
// Post Routes
// ========================
router.post("/posts", requireRole("faculty", "admin"), upload.single("file"), postCtrl.createPost);
router.get("/posts/post/:post_id", requireRole("student", "faculty", "admin"), postCtrl.getPostById);
router.get("/posts/:classroom_id", requireRole("student", "faculty", "admin"), postCtrl.getPostsByClassroom);

router.post("/posts/:post_id/submit", requireRole("student"), upload.single("file"), postCtrl.submitAssignment);
router.delete("/posts/:post_id/submit", requireRole("student"), postCtrl.unsubmitAssignment);
router.delete("/posts/:post_id", requireRole("faculty", "admin"), postCtrl.deletePost);
router.put("/posts/:post_id", requireRole("faculty", "admin"), upload.single("file"), postCtrl.updatePost);
router.get("/posts/:post_id/my-submission", requireRole("student"), postCtrl.getMySubmission);
router.get("/posts/:post_id/submissions", requireRole("faculty", "admin"), postCtrl.getSubmissions);
router.put("/posts/submissions/:submission_id/grade", requireRole("faculty", "admin"), postCtrl.gradeSubmission);
router.get("/posts/:post_id/comments", requireRole("student", "faculty", "admin"), postCtrl.getComments);
router.post("/posts/:post_id/comments", requireRole("student", "faculty", "admin"), postCtrl.addComment);
router.put("/posts/:post_id/pin", requireRole("faculty", "admin"), postCtrl.togglePinPost);

// ========================
// Student Grade Summary
// ========================
router.get("/classrooms/:id/my-grades", requireRole("student"), postCtrl.getMyGrades);

module.exports = router;
