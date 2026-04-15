const Faculty = require("../../models/Faculty");
const FacultyCourse = require("../../models/FacultyCourse");
const StudentCourse = require("../../models/StudentCourse");
const Attendance = require("../../models/Attendance");
const Student = require("../../models/Student");
const Timetable = require("../../models/Timetable");

// GET /api/erp/faculty/me
const getMyProfile = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ userId: req.user.userId });
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty profile not found" });
    }
    res.json({ success: true, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/erp/faculty
const getAllFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find().populate("userId", "email");
    res.json({ success: true, count: faculty.length, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/erp/faculty/:id
const getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id).populate("userId", "email");
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }
    res.json({ success: true, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/erp/faculty/:id/courses or /me/courses
const getFacultyCourses = async (req, res) => {
  try {
    let facultyId = req.params.id;
    if (facultyId === "me") {
      const faculty = await Faculty.findOne({ userId: req.user.userId });
      facultyId = faculty._id;
    }
    const courses = await FacultyCourse.find({ facultyId }).populate("courseId");
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/erp/faculty/course/:courseId/students
const getCourseStudents = async (req, res) => {
  try {
    const enrollments = await StudentCourse.find({
      courseId: req.params.courseId,
      status: "enrolled",
    }).populate("studentId");
    res.json({ success: true, data: enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/erp/faculty/attendance/mark
const markAttendance = async (req, res) => {
  try {
    const { courseId, date, records, weekNumber } = req.body;
    const faculty = await Faculty.findOne({ userId: req.user.userId });

    const attendanceRecords = records.map((r) => ({
      studentId: r.studentId,
      courseId,
      date,
      status: r.status,
      weekNumber,
      markedBy: faculty._id,
    }));

    await Attendance.insertMany(attendanceRecords);
    res.json({ success: true, message: `Attendance marked for ${records.length} students` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/erp/faculty/:id/timetable
const getFacultyTimetable = async (req, res) => {
  try {
    let facultyId = req.params.id;
    if (facultyId === "me") {
      const faculty = await Faculty.findOne({ userId: req.user.userId });
      facultyId = faculty._id;
    }

    const timetable = await Timetable.find({ facultyId })
      .populate("courseId", "courseCode name")
      .sort({ day: 1, startTime: 1 });

    res.json({ success: true, data: timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/erp/faculty/:id
const updateFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }
    res.json({ success: true, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/erp/faculty/:id
const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }
    await faculty.deleteOne();
    res.json({ success: true, message: "Faculty deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getMyProfile,
  getAllFaculty,
  getFacultyById,
  getFacultyCourses,
  getCourseStudents,
  markAttendance,
  getFacultyTimetable,
  updateFaculty,
  deleteFaculty,
};
