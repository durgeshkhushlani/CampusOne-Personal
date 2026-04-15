const Course = require("../../models/Course");
const Exam = require("../../models/Exam");
const ExamResult = require("../../models/ExamResult");

// GET /api/erp/courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true });
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/erp/courses/:id
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/erp/courses
const createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/erp/courses/:id
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/erp/courses/:id
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    res.json({ success: true, message: "Course deactivated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/erp/courses/exams/list
const getExams = async (req, res) => {
  try {
    const exams = await Exam.find().populate("courseId", "courseCode name").sort({ date: -1 });
    res.json({ success: true, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/erp/courses/exams/results/:studentId
const getStudentResults = async (req, res) => {
  try {
    const results = await ExamResult.find({ studentId: req.params.studentId })
      .populate({ path: "examId", populate: { path: "courseId", select: "courseCode name" } })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse, getExams, getStudentResults };
