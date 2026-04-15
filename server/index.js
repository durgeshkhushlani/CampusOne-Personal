const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Import routes
const authRoutes = require("./routes/auth");
const erpRoutes = require("./routes/erp");
const classroomRoutes = require("./routes/classroom");
const hiresphereRoutes = require("./routes/hiresphere");
const codestageRoutes = require("./routes/codestage");

// Initialize Express app
const app = express();

// ========================
// Middleware
// ========================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ========================
// Routes
// ========================
app.use("/api/auth", authRoutes);
app.use("/api/erp", erpRoutes);
app.use("/api/classroom", classroomRoutes);
app.use("/api/hiresphere", hiresphereRoutes);
app.use("/api/codestage", codestageRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "CampusOne Unified API is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ success: false, message: "Internal server error." });
});

// ========================
// Start Server
// ========================
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 CampusOne unified server running on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`   Auth:       /api/auth`);
    console.log(`   ERP:        /api/erp`);
    console.log(`   Classroom:  /api/classroom`);
    console.log(`   HireSphere: /api/hiresphere`);
    console.log(`   CodeStage:  /api/codestage`);
  });
});
