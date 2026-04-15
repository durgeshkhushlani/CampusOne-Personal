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

    let resumePath = "";
    if (req.file) {
      resumePath = req.file.filename;
    } else {
      return res.status(400).json({ message: "Please upload a resume" });
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

module.exports = { submitApplication, getApplicationsByCompany, downloadResumes, exportApplicationsExcel, getStudentApplications };
