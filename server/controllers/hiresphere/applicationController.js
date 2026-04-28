const Application = require("../../models/Application");
const Company = require("../../models/Company");
const Student = require("../../models/Student");
const archiver = require("archiver");
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");

/**
 * Helper: Get student ERP profile from their User ID
 */
async function getStudentProfile(userId) {
  return Student.findOne({ userId });
}

/**
 * Helper: Extract CGPA from application form answers
 * Looks for any question containing "CGPA" (case-insensitive)
 */
function extractCGPA(answers) {
  if (!answers || answers.length === 0) return "N/A";
  const cgpaAnswer = answers.find((a) =>
    a.question && a.question.toLowerCase().includes("cgpa")
  );
  return cgpaAnswer?.answer || "N/A";
}

// POST /api/hiresphere/applications
const submitApplication = async (req, res) => {
  try {
    const { companyId, answers } = req.body;
    const studentId = req.user.userId;

    const existing = await Application.findOne({ studentId, companyId });
    if (existing) return res.status(400).json({ message: "You have already applied to this company" });

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    // ── Eligibility Check ──
    const studentProfile = await getStudentProfile(studentId);
    if (studentProfile) {
      // Check CGPA: try from form answers first, fallback to profile if it has cgpa
      const parsedAns = typeof answers === "string" ? JSON.parse(answers) : answers;
      const cgpaStr = extractCGPA(parsedAns || []);
      const studentCGPA = cgpaStr !== "N/A" ? parseFloat(cgpaStr) : (studentProfile.cgpa || 0);
      if (company.minCGPA && company.minCGPA > 0 && studentCGPA < company.minCGPA) {
        return res.status(403).json({ message: "You do not meet the eligibility criteria for this company." });
      }
      // Check branch/department
      if (company.eligibleBranches && company.eligibleBranches.length > 0) {
        const dept = (studentProfile.department || "").toLowerCase().trim();
        const eligible = company.eligibleBranches.map(b => b.toLowerCase().trim());
        if (!eligible.includes(dept)) {
          return res.status(403).json({ message: "You do not meet the eligibility criteria for this company." });
        }
      }
    }

    let resumePath = "";
    if (company.resumeType === "link") {
      const { resume } = req.body;
      if (!resume || !resume.trim()) {
        return res.status(400).json({ message: "Please provide your resume link" });
      }
      resumePath = resume.trim();
    } else {
      if (req.file) {
        resumePath = req.file.filename;
      } else {
        return res.status(400).json({ message: "Please upload your resume" });
      }
    }

    const parsedAnswers = typeof answers === "string" ? JSON.parse(answers) : answers;

    const application = await Application.create({
      studentId,
      companyId,
      answers: parsedAnswers || [],
      resume: resumePath,
    });

    res.status(201).json(application);
  } catch (error) {
    console.error("Submit application error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/hiresphere/applications/company/:companyId
const getApplicationsByCompany = async (req, res) => {
  try {
    const applications = await Application.find({ companyId: req.params.companyId })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    // Enrich each application with ERP data (enrollmentNo) and CGPA from answers
    const enriched = await Promise.all(
      applications.map(async (app) => {
        const appObj = app.toObject();
        const profile = await getStudentProfile(app.studentId?._id);
        appObj.enrollmentNo = profile?.enrollmentNo || "N/A";
        appObj.department = profile?.department || "N/A";
        appObj.cgpa = extractCGPA(app.answers);
        return appObj;
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/hiresphere/applications/company/:companyId/download
const downloadResumes = async (req, res) => {
  try {
    const applications = await Application.find({ companyId: req.params.companyId });
    if (applications.length === 0) return res.status(404).json({ message: "No applications found" });

    const company = await Company.findById(req.params.companyId);
    const zipFileName = `${company.name.replace(/\s+/g, "_")}_resumes.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${zipFileName}"`);

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    const uploadsDir = path.join(__dirname, "..", "..", "uploads", "resumes");

    for (const app of applications) {
      const filePath = path.join(uploadsDir, app.resume);
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: app.resume });
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error("Download resumes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/hiresphere/applications/company/:companyId/export
const exportApplicationsExcel = async (req, res) => {
  try {
    const applications = await Application.find({ companyId: req.params.companyId })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    const company = await Company.findById(req.params.companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    // Build rows with ERP data + CGPA from answers
    const rows = await Promise.all(
      applications.map(async (app, idx) => {
        const profile = await getStudentProfile(app.studentId?._id);

        const row = {
          "S.No": idx + 1,
          "Student Name": app.studentId?.name || "N/A",
          "Email": app.studentId?.email || "N/A",
          "Enrollment No": profile?.enrollmentNo || "N/A",
          "Department": profile?.department || "N/A",
          "Semester": profile?.semester || "N/A",
          "CGPA": extractCGPA(app.answers),
          "Applied On": new Date(app.createdAt).toLocaleDateString("en-IN"),
        };

        // Add form question answers as columns
        if (app.answers?.length > 0) {
          app.answers.forEach((a, i) => {
            row[`Q${i + 1}: ${a.question}`] = a.answer || "";
          });
        }

        return row;
      })
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No applications to export" });
    }

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    // Auto-size columns
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...rows.map((r) => String(r[key] || "").length)) + 2,
    }));
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Applications");

    // Write to buffer and send
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
    const fileName = `${company.name.replace(/\s+/g, "_")}_applications.xlsx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(buf);
  } catch (error) {
    console.error("Export applications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/hiresphere/applications/student
const getStudentApplications = async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.user.userId })
      .populate("companyId", "name role")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error("Get student applications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { submitApplication, getApplicationsByCompany, downloadResumes, exportApplicationsExcel, getStudentApplications, updateApplicationStatus, withdrawApplication, getPlacementStats };

// PUT /api/hiresphere/applications/:applicationId/status — Admin only
async function updateApplicationStatus(req, res) {
  try {
    const { status } = req.body;
    const validStatuses = ["applied", "shortlisted", "rejected", "selected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const application = await Application.findByIdAndUpdate(
      req.params.applicationId,
      { status },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.json(application);
  } catch (error) {
    console.error("Update application status error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// DELETE /api/hiresphere/applications/:applicationId — Student only
async function withdrawApplication(req, res) {
  try {
    const application = await Application.findById(req.params.applicationId);
    if (!application) return res.status(404).json({ message: "Application not found" });

    if (application.studentId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (application.status !== "applied") {
      return res.status(400).json({ message: "Cannot withdraw — application has already been processed" });
    }

    await application.deleteOne();
    res.json({ message: "Application withdrawn successfully" });
  } catch (error) {
    console.error("Withdraw application error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/hiresphere/stats — Admin only
async function getPlacementStats(req, res) {
  try {
    const totalCompanies = await Company.countDocuments();
    const totalApplications = await Application.countDocuments();
    const totalSelected = await Application.countDocuments({ status: "selected" });

    // Top company: company with most selected students
    const topCompanyAgg = await Application.aggregate([
      { $match: { status: "selected" } },
      { $group: { _id: "$companyId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    let topCompany = null;
    if (topCompanyAgg.length > 0) {
      const comp = await Company.findById(topCompanyAgg[0]._id).select("name");
      topCompany = { name: comp?.name || "Unknown", selectedCount: topCompanyAgg[0].count };
    }

    res.json({ totalCompanies, totalApplications, totalSelected, topCompany });
  } catch (error) {
    console.error("Get placement stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
