const User = require("../models/User");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const jwt = require("jsonwebtoken");

/**
 * @desc    Login user & return JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT — role is auto-detected from the stored document
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Fetch profile specific data
    let profile = {};
    if (user.role === "student") {
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        profile = {
          semester: student.semester,
          department: student.department,
          program: student.program,
        };
      }
    } else if (user.role === "faculty") {
      const faculty = await Faculty.findOne({ userId: user._id });
      if (faculty) {
        profile = {
          department: faculty.department,
        };
      }
    }

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...profile
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

/**
 * @desc    Get current logged-in user's profile
 * @route   GET /api/auth/me
 * @access  Private (requires valid JWT)
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Fetch profile specific data
    let profile = {};
    if (user.role === "student") {
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        profile = {
          semester: student.semester,
          department: student.department,
          program: student.program,
        };
      }
    } else if (user.role === "faculty") {
      const faculty = await Faculty.findOne({ userId: user._id });
      if (faculty) {
        profile = {
          department: faculty.department,
        };
      }
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...profile
      },
    });
  } catch (error) {
    console.error("GetMe error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

module.exports = { login, getMe };
