const Student = require("../../models/Student");
const User = require("../../models/User");
const StudentCourse = require("../../models/StudentCourse");
const Attendance = require("../../models/Attendance");
const Fee = require("../../models/Fee");
const Course = require("../../models/Course");
const Timetable = require("../../models/Timetable");
const FacultyCourse = require("../../models/FacultyCourse");
const Faculty = require("../../models/Faculty");

// GET /api/erp/students/me
const getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/erp/students
const getAllStudents = async (req, res) => {
  try {
    const { department, semester, program, search } = req.query;
    let query = {};
    if (department) query.department = department;
    if (semester) query.semester = parseInt(semester);
    if (program) query.program = program;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { enrollmentNo: { $regex: search, $options: "i" } },
      ];
    }
    const students = await Student.find(query).populate("userId", "email");
    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/erp/students/:id
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("userId", "email");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/erp/students/:id/courses
const getStudentCourses = async (req, res) => {
  try {
    let studentId = req.params.id;
    if (studentId === "me") {
      const student = await Student.findOne({ userId: req.user.userId });
      studentId = student._id;
    }
    const enrollments = await StudentCourse.find({ studentId, status: "enrolled" }).populate("courseId");

    const coursesWithFaculty = await Promise.all(
      enrollments.map(async (enrollment) => {
        const fc = await FacultyCourse.findOne({ courseId: enrollment.courseId._id }).populate("facultyId");
        return { ...enrollment.toObject(), faculty: fc ? fc.facultyId : null };
      })
    );

    res.json({ success: true, data: coursesWithFaculty });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/erp/students/:id/attendance
const getStudentAttendance = async (req, res) => {
  try {
    let studentId = req.params.id;
    if (studentId === "me") {
      const student = await Student.findOne({ userId: req.user.userId });
      studentId = student._id;
    }

    const enrollments = await StudentCourse.find({ studentId, status: "enrolled" }).populate("courseId");

    const attendanceSummary = await Promise.all(
      enrollments.map(async (enrollment) => {
        const records = await Attendance.find({
          studentId,
          courseId: enrollment.courseId._id,
        }).sort({ date: -1 });

        const total = records.length;
        const present = records.filter((r) => r.status === "present" || r.status === "late").length;
        const absent = records.filter((r) => r.status === "absent").length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

        const weeklyData = {};
        records.forEach((r) => {
          if (!weeklyData[r.weekNumber]) {
            weeklyData[r.weekNumber] = { total: 0, present: 0 };
          }
          weeklyData[r.weekNumber].total++;
          if (r.status === "present" || r.status === "late") {
            weeklyData[r.weekNumber].present++;
          }
        });

        const lastUpdated = records.length > 0 ? records[0].date : null;

        return {
          course: enrollment.courseId,
          totalClasses: total,
          attended: present,
          absent,
          percentage,
          weeklyBreakdown: weeklyData,
          lastUpdated,
          belowMinimum: percentage < 70,
        };
      })
    );

    res.json({ success: true, data: attendanceSummary });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/erp/students/:id/fees
const getStudentFees = async (req, res) => {
  try {
    let studentId = req.params.id;
    if (studentId === "me") {
      const student = await Student.findOne({ userId: req.user.userId });
      studentId = student._id;
    }
    const fees = await Fee.find({ studentId }).sort({ semester: -1 });
    res.json({ success: true, data: fees });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/erp/students/:id/timetable
const getStudentTimetable = async (req, res) => {
  try {
    let studentId = req.params.id;
    if (studentId === "me") {
      const student = await Student.findOne({ userId: req.user.userId });
      studentId = student._id;
    }

    const enrollments = await StudentCourse.find({ studentId, status: "enrolled" }).populate("courseId");
    const courseIds = enrollments.map((e) => e.courseId._id);

    const timetable = await Timetable.find({ courseId: { $in: courseIds } })
      .populate("courseId", "courseCode name")
      .populate("facultyId", "firstName lastName")
      .sort({ day: 1, startTime: 1 });

    res.json({ success: true, data: timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/erp/students/:id
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/erp/students/:id
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    await student.deleteOne();
    res.json({ success: true, message: "Student deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getMyProfile,
  getAllStudents,
  getStudentById,
  getStudentCourses,
  getStudentAttendance,
  getStudentFees,
  getStudentTimetable,
  updateStudent,
  deleteStudent,
};
