const Company = require("../../models/Company");
const User = require("../../models/User");

// POST /api/hiresphere/companies
const createCompany = async (req, res) => {
  try {
    const { name, role, description, formQuestions, lastDate, minCGPA, eligibleBranches } = req.body;

    const company = await Company.create({
      name,
      role,
      description,
      lastDate,
      formQuestions: formQuestions || [],
      minCGPA: minCGPA || 0,
      eligibleBranches: eligibleBranches || [],
      createdByAdmin: req.user.userId,
    });

    res.status(201).json(company);
  } catch (error) {
    console.error("Create company error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/hiresphere/companies
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json(companies);
  } catch (error) {
    console.error("Get companies error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/hiresphere/companies/:id
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json(company);
  } catch (error) {
    console.error("Get company error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/hiresphere/companies/:id
const updateCompany = async (req, res) => {
  try {
    const { name, role, description, formQuestions, lastDate, minCGPA, eligibleBranches } = req.body;
    const company = await Company.findById(req.params.id);

    if (!company) return res.status(404).json({ message: "Company not found" });

    if (company.createdByAdmin.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this company" });
    }

    if (name) company.name = name;
    if (role) company.role = role;
    if (description) company.description = description;
    if (lastDate) company.lastDate = lastDate;
    if (formQuestions) company.formQuestions = formQuestions;
    if (minCGPA !== undefined) company.minCGPA = minCGPA;
    if (eligibleBranches !== undefined) company.eligibleBranches = eligibleBranches;

    await company.save();
    res.json(company);
  } catch (error) {
    console.error("Update company error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createCompany, getCompanies, getCompanyById, updateCompany };
