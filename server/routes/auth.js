const express = require("express");
const router = express.Router();
const { login, getMe } = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

// POST /api/auth/login — public
router.post("/login", login);

// GET /api/auth/me — private
router.get("/me", verifyToken, getMe);

module.exports = router;
