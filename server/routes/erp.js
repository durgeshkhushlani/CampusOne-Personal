const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const studentCtrl = require("../controllers/erp/studentController");
const facultyCtrl = require("../controllers/erp/facultyController");
const courseCtrl = require("../controllers/erp/courseController");
const adminCtrl = require("../controllers/erp/adminController");
const erpExtCtrl = require("../controllers/erp/erpEnhancementController");

// All ERP routes require authentication
router.use(verifyToken);

// ========================
// Student Routes
// ========================
router.get("/students/me", requireRole("student"), studentCtrl.getMyProfile);
router.get("/students/me/courses", requireRole("student"), (req, res, next) => {
  req.params.id = "me";
  studentCtrl.getStudentCourses(req, res, next);
});
router.get("/students/me/attendance", requireRole("student"), (req, res, next) => {
  req.params.id = "me";
  studentCtrl.getStudentAttendance(req, res, next);
});
router.get("/students/me/fees", requireRole("student"), (req, res, next) => {
  req.params.id = "me";
  studentCtrl.getStudentFees(req, res, next);
});
router.get("/students/me/timetable", requireRole("student"), (req, res, next) => {
  req.params.id = "me";
  studentCtrl.getStudentTimetable(req, res, next);
});
router.put("/students/me/profile", requireRole("student"), erpExtCtrl.updateMyProfile);

// Admin-level student management
router.get("/students", requireRole("admin"), studentCtrl.getAllStudents);
router.get("/students/:id", requireRole("admin"), studentCtrl.getStudentById);
router.get("/students/:id/courses", requireRole("admin", "faculty"), studentCtrl.getStudentCourses);
router.get("/students/:id/attendance", requireRole("admin", "faculty"), studentCtrl.getStudentAttendance);
router.get("/students/:id/fees", requireRole("admin"), studentCtrl.getStudentFees);
router.put("/students/:id", requireRole("faculty", "admin"), studentCtrl.updateStudent);
router.delete("/students/:id", requireRole("admin"), studentCtrl.deleteStudent);

// ========================
// Faculty Routes
// ========================
router.get("/faculty/me", requireRole("faculty"), facultyCtrl.getMyProfile);
router.get("/faculty/me/courses", requireRole("faculty"), (req, res, next) => {
  req.params.id = "me";
  facultyCtrl.getFacultyCourses(req, res, next);
});
router.get("/faculty/me/timetable", requireRole("faculty"), (req, res, next) => {
  req.params.id = "me";
  facultyCtrl.getFacultyTimetable(req, res, next);
});

router.get("/faculty/course/:courseId/students", requireRole("faculty", "admin"), facultyCtrl.getCourseStudents);
router.post("/faculty/attendance/mark", requireRole("faculty"), facultyCtrl.markAttendance);

router.get("/faculty", requireRole("admin"), facultyCtrl.getAllFaculty);
router.get("/faculty/:id", requireRole("admin"), facultyCtrl.getFacultyById);
router.get("/faculty/:id/courses", requireRole("admin"), facultyCtrl.getFacultyCourses);
router.put("/faculty/:id", requireRole("admin"), facultyCtrl.updateFaculty);
router.delete("/faculty/:id", requireRole("admin"), facultyCtrl.deleteFaculty);

// ========================
// Course Routes
// ========================
router.get("/courses", requireRole("student", "faculty", "admin"), courseCtrl.getAllCourses);
router.post("/courses", requireRole("admin"), courseCtrl.createCourse);

// Exam routes (MUST be before /courses/:id to avoid param conflict)
router.get("/courses/exams/list", requireRole("student", "faculty", "admin"), courseCtrl.getExams);
router.get("/courses/exams/results/me", requireRole("student"), erpExtCtrl.getMyResults);
router.get("/courses/exams/results/:studentId", requireRole("student", "faculty", "admin"), courseCtrl.getStudentResults);
router.get("/courses/exams/by-faculty", requireRole("faculty"), erpExtCtrl.getExamsByFaculty);
router.get("/courses/exams/:examId/results", requireRole("faculty", "admin"), erpExtCtrl.getResultsByExam);
router.post("/courses/exams", requireRole("faculty", "admin"), erpExtCtrl.createExam);
router.post("/courses/exams/results", requireRole("faculty", "admin"), erpExtCtrl.createOrUpdateResult);

router.get("/courses/:id", requireRole("student", "faculty", "admin"), courseCtrl.getCourseById);
router.put("/courses/:id", requireRole("admin"), courseCtrl.updateCourse);
router.delete("/courses/:id", requireRole("admin"), courseCtrl.deleteCourse);

// ========================
// Admin Routes
// ========================
router.get("/admin/stats", requireRole("admin"), adminCtrl.getDashboardStats);
router.get("/admin/defaulters", requireRole("admin"), adminCtrl.getDefaulters);
router.get("/admin/announcements", requireRole("student", "faculty", "admin"), adminCtrl.getAnnouncements);
router.post("/admin/announcements", requireRole("admin"), adminCtrl.createAnnouncement);
router.delete("/admin/announcements/:id", requireRole("admin"), adminCtrl.deleteAnnouncement);

module.exports = router;
