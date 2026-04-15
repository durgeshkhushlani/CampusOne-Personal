const Classroom = require("../../models/Classroom");
const Enrollment = require("../../models/Enrollment");
const User = require("../../models/User");
const crypto = require("crypto");

const THEME_COLORS = [
  "#1967d2", "#1e8e3e", "#e8710a", "#d93025",
  "#9334e6", "#185abc", "#137333", "#b06000",
];

// POST /api/classroom/classrooms — Faculty only
const createClassroom = async (req, res) => {
  try {
    const { name, section, subject, description } = req.body;
    const code = crypto.randomBytes(3).toString("hex");
    const themeColor = THEME_COLORS[Math.floor(Math.random() * THEME_COLORS.length)];

    const classroom = await Classroom.create({
      name, section, subject, description,
      facultyId: req.user.userId,
      code, themeColor,
    });

    res.status(201).json(classroom);
  } catch (error) {
    console.error("Create classroom error:", error);
    res.status(500).json({ error: "Failed to create classroom" });
  }
};

// POST /api/classroom/classrooms/join — Student only
const joinClassroom = async (req, res) => {
  try {
    const { code } = req.body;
    const classroom = await Classroom.findOne({ code });
    if (!classroom) return res.status(404).json({ error: "Classroom not found" });

    const existing = await Enrollment.findOne({ classroomId: classroom._id, studentId: req.user.userId });
    if (existing) return res.status(400).json({ error: "Already enrolled in this class" });

    await Enrollment.create({ classroomId: classroom._id, studentId: req.user.userId });
    res.json({ message: "Joined successfully", classroom });
  } catch (error) {
    console.error("Join classroom error:", error);
    res.status(400).json({ error: "Failed to join classroom" });
  }
};

// GET /api/classroom/classrooms
const listClassrooms = async (req, res) => {
  try {
    let classrooms;
    if (req.user.role === "admin") {
      // Admin sees ALL classrooms
      classrooms = await Classroom.find();
    } else if (req.user.role === "faculty") {
      classrooms = await Classroom.find({ facultyId: req.user.userId });
    } else {
      const enrollments = await Enrollment.find({ studentId: req.user.userId });
      const classroomIds = enrollments.map((e) => e.classroomId);
      classrooms = await Classroom.find({ _id: { $in: classroomIds } });
    }

    // Attach student count and faculty name
    const result = await Promise.all(
      classrooms.map(async (cls) => {
        const studentCount = await Enrollment.countDocuments({ classroomId: cls._id });
        const faculty = await User.findById(cls.facultyId).select("name");
        return {
          ...cls.toObject(),
          student_count: studentCount,
          faculty_name: faculty ? faculty.name : "Unknown",
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error("List classrooms error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/classroom/classrooms/:id
const getClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) return res.status(404).json({ error: "Classroom not found" });

    const studentCount = await Enrollment.countDocuments({ classroomId: classroom._id });
    const faculty = await User.findById(classroom.facultyId).select("name");

    res.json({
      ...classroom.toObject(),
      student_count: studentCount,
      faculty_name: faculty ? faculty.name : "Unknown",
    });
  } catch (error) {
    console.error("Get classroom error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/classroom/classrooms/:id/people
const getPeople = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) return res.status(404).json({ error: "Not found" });

    const faculty = await User.findById(classroom.facultyId).select("name email");
    const enrollments = await Enrollment.find({ classroomId: req.params.id }).populate("studentId", "name email");

    const students = enrollments.map((e) => ({
      id: e.studentId._id,
      name: e.studentId.name,
      email: e.studentId.email,
      joined_at: e.createdAt,
    }));

    res.json({ faculty, students });
  } catch (error) {
    console.error("Get people error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE /api/classroom/classrooms/:id — Admin only
const deleteClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) return res.status(404).json({ error: "Classroom not found" });

    // Delete all enrollments and posts for this classroom
    await Enrollment.deleteMany({ classroomId: classroom._id });
    const Post = require("../../models/Post");
    await Post.deleteMany({ classroom_id: classroom._id });
    await classroom.deleteOne();

    res.json({ message: "Classroom deleted successfully" });
  } catch (error) {
    console.error("Delete classroom error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createClassroom, joinClassroom, listClassrooms, getClassroom, getPeople, deleteClassroom };
