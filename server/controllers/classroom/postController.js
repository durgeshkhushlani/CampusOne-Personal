const Post = require("../../models/Post");
const ClassroomSubmission = require("../../models/ClassroomSubmission");
const Comment = require("../../models/Comment");
const User = require("../../models/User");

// POST /api/classroom/posts
const createPost = async (req, res) => {
  try {
    const { classroom_id, title, content, type, due_date, total_points } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const fileName = req.file ? req.file.originalname : null;

    const post = await Post.create({
      classroomId: classroom_id,
      authorId: req.user.userId,
      title, content, type,
      fileUrl, fileName,
      dueDate: due_date || null,
      totalPoints: total_points || 100,
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

    const existing = await ClassroomSubmission.findOne({
      postId: req.params.post_id,
      studentId: req.user.userId,
    });

    if (existing) {
      existing.fileUrl = fileUrl;
      existing.fileName = fileName;
      existing.status = "submitted";
      await existing.save();
    } else {
      await ClassroomSubmission.create({
        postId: req.params.post_id,
        studentId: req.user.userId,
        fileUrl, fileName,
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

module.exports = {
  createPost,
  getPostsByClassroom,
  submitAssignment,
  getMySubmission,
  getSubmissions,
  gradeSubmission,
  getComments,
  addComment,
};
