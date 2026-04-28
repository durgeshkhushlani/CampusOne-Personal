const Post = require("../../models/Post");
const ClassroomSubmission = require("../../models/ClassroomSubmission");
const Comment = require("../../models/Comment");
const User = require("../../models/User");
const Classroom = require("../../models/Classroom");

// POST /api/classroom/posts
const createPost = async (req, res) => {
  try {
    const { classroom_id, title, content, type, due_date, total_points, topic } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const fileName = req.file ? req.file.originalname : null;

    const post = await Post.create({
      classroomId: classroom_id,
      authorId: req.user.userId,
      title, content, type,
      fileUrl, fileName,
      dueDate: due_date || null,
      totalPoints: total_points || 100,
      topic: topic || "General",
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
};

// GET /api/classroom/posts/:classroom_id
const getPostsByClassroom = async (req, res) => {
  try {
    const posts = await Post.find({ classroomId: req.params.classroom_id })
      .populate("authorId", "name")
      .sort({ createdAt: -1 });

    const result = await Promise.all(
      posts.map(async (post) => {
        let submissionCount = 0;
        if (post.type === "assignment") {
          submissionCount = await ClassroomSubmission.countDocuments({ postId: post._id });
        }
        const commentCount = await Comment.countDocuments({ postId: post._id });

        return {
          ...post.toObject(),
          author_name: post.authorId?.name || "Unknown",
          submission_count: submissionCount,
          comment_count: commentCount,
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/classroom/posts/:post_id/submit
const submitAssignment = async (req, res) => {
  try {
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const fileName = req.file ? req.file.originalname : null;
    if (!fileUrl) return res.status(400).json({ error: "File is required" });

    // Check if submission is late
    const post = await Post.findById(req.params.post_id);
    const isLate = post && post.dueDate ? new Date() > new Date(post.dueDate) : false;

    const existing = await ClassroomSubmission.findOne({
      postId: req.params.post_id,
      studentId: req.user.userId,
    });

    if (existing) {
      existing.fileUrl = fileUrl;
      existing.fileName = fileName;
      existing.status = "submitted";
      existing.isLate = isLate;
      await existing.save();
    } else {
      await ClassroomSubmission.create({
        postId: req.params.post_id,
        studentId: req.user.userId,
        fileUrl, fileName,
        isLate,
      });
    }

    res.json({ message: "Submitted successfully" });
  } catch (error) {
    console.error("Submit assignment error:", error);
    res.status(500).json({ error: "Submission failed" });
  }
};

// GET /api/classroom/posts/:post_id/my-submission
const getMySubmission = async (req, res) => {
  try {
    const submission = await ClassroomSubmission.findOne({
      postId: req.params.post_id,
      studentId: req.user.userId,
    });
    res.json(submission || null);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/classroom/posts/:post_id/submissions — Faculty only
const getSubmissions = async (req, res) => {
  try {
    const submissions = await ClassroomSubmission.find({ postId: req.params.post_id })
      .populate("studentId", "name email");
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// PUT /api/classroom/posts/submissions/:submission_id/grade — Faculty only
const gradeSubmission = async (req, res) => {
  try {
    const { grade } = req.body;
    await ClassroomSubmission.findByIdAndUpdate(req.params.submission_id, {
      grade, status: "graded",
    });
    res.json({ message: "Graded successfully" });
  } catch (error) {
    res.status(500).json({ error: "Grading failed" });
  }
};

// GET /api/classroom/posts/:post_id/comments
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.post_id })
      .populate("userId", "name role")
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/classroom/posts/:post_id/comments
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.create({
      postId: req.params.post_id,
      userId: req.user.userId,
      content,
    });
    const populated = await Comment.findById(comment._id).populate("userId", "name role");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment" });
  }
};

// GET /api/classroom/classrooms/:id/my-grades — Student grade summary
const getMyGrades = async (req, res) => {
  try {
    const classroomId = req.params.id;
    const studentId = req.user.userId;

    // Find all assignment posts for this classroom
    const assignments = await Post.find({ classroomId, type: "assignment" }).sort({ createdAt: -1 });

    const grades = await Promise.all(
      assignments.map(async (post) => {
        const submission = await ClassroomSubmission.findOne({ postId: post._id, studentId });
        return {
          postId: post._id,
          postTitle: post.title,
          totalPoints: post.totalPoints,
          grade: submission ? submission.grade : null,
          status: submission ? submission.status : "not_submitted",
          dueDate: post.dueDate,
          isLate: submission ? submission.isLate : false,
        };
      })
    );

    res.json(grades);
  } catch (error) {
    console.error("Get my grades error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// PUT /api/classroom/posts/:post_id/pin — Toggle pin
const togglePinPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.isPinned = !post.isPinned;
    await post.save();

    res.json({ message: post.isPinned ? "Post pinned" : "Post unpinned", isPinned: post.isPinned });
  } catch (error) {
    console.error("Toggle pin error:", error);
    res.status(500).json({ error: "Failed to toggle pin" });
  }
};

// GET /api/classroom/posts/post/:post_id
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id).populate("authorId", "name");
    if (!post) return res.status(404).json({ error: "Post not found" });
    
    let submissionCount = 0;
    if (post.type === "assignment") {
      submissionCount = await ClassroomSubmission.countDocuments({ postId: post._id });
    }
    const commentCount = await Comment.countDocuments({ postId: post._id });

    const result = {
      ...post.toObject(),
      author_name: post.authorId?.name || "Unknown",
      submission_count: submissionCount,
      comment_count: commentCount,
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE /api/classroom/posts/:post_id/submit
const unsubmitAssignment = async (req, res) => {
  try {
    const existing = await ClassroomSubmission.findOne({
      postId: req.params.post_id,
      studentId: req.user.userId,
    });
    if (!existing) return res.status(404).json({ error: "Submission not found" });
    if (existing.status === "graded") return res.status(400).json({ error: "Cannot unsubmit a graded assignment" });
    
    await existing.deleteOne();
    res.json({ message: "Unsubmitted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Unsubmit failed" });
  }
};

// DELETE /api/classroom/posts/:post_id
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Fetch classroom to check if user is the assigned faculty
    const classroom = await Classroom.findById(post.classroomId);
    
    // Check authorization:
    // 1. User is the author of the post
    // 2. User is the Faculty assigned to the classroom
    // 3. User is an Admin
    const isAuthor = post.authorId.toString() === req.user.userId.toString();
    const isAssignedFaculty = classroom && classroom.facultyId && classroom.facultyId.toString() === req.user.userId.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAssignedFaculty && !isAdmin) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Delete related submissions and comments
    await ClassroomSubmission.deleteMany({ postId: post._id });
    await Comment.deleteMany({ postId: post._id });

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
};

module.exports = {
  createPost,
  getPostsByClassroom,
  getPostById,
  submitAssignment,
  unsubmitAssignment,
  getMySubmission,
  getSubmissions,
  gradeSubmission,
  getComments,
  addComment,
  getMyGrades,
  togglePinPost,
  deletePost,
};
