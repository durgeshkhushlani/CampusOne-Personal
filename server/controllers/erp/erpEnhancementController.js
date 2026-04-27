const Exam = require("../../models/Exam");
const ExamResult = require("../../models/ExamResult");
const Student = require("../../models/Student");
const FacultyCourse = require("../../models/FacultyCourse");
const Faculty = require("../../models/Faculty");

// POST /api/erp/courses/exams — Create an exam (faculty/admin)
const createExam = async (req, res) => {
  try {
    const { courseId, name, type, date, totalMarks, duration } = req.body;
    const exam = await Exam.create({ courseId, name, type, date, totalMarks, duration });
    res.status(201).json({ success: true, data: exam });
  } catch (error) {
    console.error("Create exam error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/erp/courses/exams/results — Create/update an exam result (faculty/admin)
const createOrUpdateResult = async (req, res) => {
  try {
    const { studentId, examId, marksObtained, grade, remarks } = req.body;
    const result = await ExamResult.findOneAndUpdate(
      { examId, studentId },
      { marksObtained, grade, remarks },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Create/update result error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/erp/courses/exams/results/me — Student's own results
const getMyResults = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    const results = await ExamResult.find({ studentId: student._id })
      .populate({ path: "examId", populate: { path: "courseId", select: "courseCode name" } })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: results });
  } catch (error) {
    console.error("Get my results error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/erp/courses/exams/by-faculty — Exams for faculty's courses
const getExamsByFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ userId: req.user.userId });
    if (!faculty) return res.status(404).json({ success: false, message: "Faculty not found" });

    const facultyCourses = await FacultyCourse.find({ facultyId: faculty._id }).select("courseId");
    const courseIds = facultyCourses.map((fc) => fc.courseId);

    const exams = await Exam.find({ courseId: { $in: courseIds } })
      .populate("courseId", "courseCode name")
      .sort({ date: -1 });
    res.json({ success: true, data: exams });
  } catch (error) {
    console.error("Get exams by faculty error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/erp/courses/exams/:examId/results — All results for a specific exam
const getResultsByExam = async (req, res) => {
  try {
    const results = await ExamResult.find({ examId: req.params.examId })
      .populate("studentId", "firstName lastName enrollmentNo")
      .sort({ marksObtained: -1 });
    res.json({ success: true, data: results });
  } catch (error) {
    console.error("Get results by exam error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/erp/students/me/profile — Student self-service profile update
const updateMyProfile = async (req, res) => {
  try {
    const { phone, address, bloodGroup } = req.body;
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    if (phone !== undefined) student.phone = phone;
    if (address !== undefined) student.address = address;
    if (bloodGroup !== undefined) student.bloodGroup = bloodGroup;

    await student.save();
    res.json({ success: true, data: student });
  } catch (error) {
    console.error("Update my profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { createExam, createOrUpdateResult, getMyResults, getExamsByFaculty, getResultsByExam, updateMyProfile };
