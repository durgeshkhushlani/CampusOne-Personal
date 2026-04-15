const Student = require("../../models/Student");
const Faculty = require("../../models/Faculty");
const Course = require("../../models/Course");
const Fee = require("../../models/Fee");
const Announcement = require("../../models/Announcement");

// GET /api/erp/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalFaculty = await Faculty.countDocuments();
    const totalCourses = await Course.countDocuments({ isActive: true });
    const feeDefaulters = await Fee.countDocuments({ status: { $in: ["unpaid", "overdue"] } });

    res.json({
      success: true,
      data: { totalStudents, totalFaculty, totalCourses, feeDefaulters },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/erp/admin/defaulters
const getDefaulters = async (req, res) => {
  try {
    const defaulters = await Fee.find({ status: { $in: ["unpaid", "overdue"] } })
      .populate({ path: "studentId", populate: { path: "userId", select: "email" } })
      .sort({ dueDate: 1 });
    res.json({ success: true, data: defaulters });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/erp/admin/announcements
const createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      author: req.user.userId,
    });
    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/erp/admin/announcements
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/erp/admin/announcements/:id
const deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Announcement deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getDashboardStats, getDefaulters, createAnnouncement, getAnnouncements, deleteAnnouncement };
