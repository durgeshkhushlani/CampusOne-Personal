const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");
const companyCtrl = require("../controllers/hiresphere/companyController");
const applicationCtrl = require("../controllers/hiresphere/applicationController");

// All HireSphere routes require authentication
router.use(verifyToken);

// Company routes
router.post("/companies", requireRole("admin"), companyCtrl.createCompany);
router.get("/companies", requireRole("student", "admin"), companyCtrl.getCompanies);
router.get("/companies/:id", requireRole("student", "admin"), companyCtrl.getCompanyById);
router.put("/companies/:id", requireRole("admin"), companyCtrl.updateCompany);
router.delete("/companies/:id", requireRole("admin"), companyCtrl.deleteCompany);

// Application routes
router.post("/applications", requireRole("student"), upload.single("resume"), applicationCtrl.submitApplication);
router.get("/applications/student", requireRole("student"), applicationCtrl.getStudentApplications);
router.get("/applications/company/:companyId", requireRole("admin"), applicationCtrl.getApplicationsByCompany);
router.get("/applications/company/:companyId/download", requireRole("admin"), applicationCtrl.downloadResumes);
router.get("/applications/company/:companyId/export", requireRole("admin"), applicationCtrl.exportApplicationsExcel);
router.put("/applications/:applicationId/status", requireRole("admin"), applicationCtrl.updateApplicationStatus);
router.delete("/applications/:applicationId", requireRole("student"), applicationCtrl.withdrawApplication);

// Stats route
router.get("/stats", requireRole("admin"), applicationCtrl.getPlacementStats);

module.exports = router;
