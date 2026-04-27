const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");
const crypto = require("crypto");

// Load environment variables from root .env
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Import all models
const User = require("./models/User");
const Student = require("./models/Student");
const Faculty = require("./models/Faculty");
const Admin = require("./models/Admin");
const Course = require("./models/Course");
const StudentCourse = require("./models/StudentCourse");
const FacultyCourse = require("./models/FacultyCourse");
const Fee = require("./models/Fee");
const Attendance = require("./models/Attendance");
const Timetable = require("./models/Timetable");
const Exam = require("./models/Exam");
const ExamResult = require("./models/ExamResult");
const Announcement = require("./models/Announcement");
const Classroom = require("./models/Classroom");
const Enrollment = require("./models/Enrollment");
const Post = require("./models/Post");
const Company = require("./models/Company");

// ════════════════════════════════════════════
// Data Definitions
// ════════════════════════════════════════════

// 50 Students — email = firstname.lastname@campusone.com, password = firstname@DDMMYYYY#
const STUDENT_NAMES = [
  { first: "Durgesh", last: "Khushlani", dob: new Date(2004, 2, 15) },       // 15-03-2004
  { first: "Jay", last: "Unadkat", dob: new Date(2004, 6, 22) },         // 22-07-2004
  { first: "Moksh", last: "Mehta", dob: new Date(2003, 11, 8) },         // 08-12-2003
  { first: "Priyanshu", last: "Dhrangdhariya", dob: new Date(2004, 0, 30) }, // 30-01-2004
  { first: "Rohit", last: "Mehra", dob: new Date(2003, 8, 12) },         // 12-09-2003
  { first: "Ishaan", last: "Reddy", dob: new Date(2004, 3, 5) },         // 05-04-2004
  { first: "Priya", last: "Nair", dob: new Date(2004, 5, 18) },          // 18-06-2004
  { first: "Arjun", last: "Singh", dob: new Date(2003, 10, 25) },        // 25-11-2003
  { first: "Kavya", last: "Desai", dob: new Date(2004, 1, 14) },         // 14-02-2004
  { first: "Reyansh", last: "Kumar", dob: new Date(2003, 7, 3) },      // 03-08-2003
  { first: "Saanvi", last: "Choudhary", dob: new Date(2004, 4, 9) },   // 09-05-2004
  { first: "Aditya", last: "Joshi", dob: new Date(2003, 9, 20) },      // 20-10-2003
  { first: "Meera", last: "Pillai", dob: new Date(2004, 7, 11) },      // 11-08-2004
  { first: "Vihaan", last: "Rao", dob: new Date(2003, 5, 27) },        // 27-06-2003
  { first: "Tanya", last: "Bhatia", dob: new Date(2004, 2, 1) },       // 01-03-2004
  { first: "Kabir", last: "Malhotra", dob: new Date(2004, 8, 16) },    // 16-09-2004
  { first: "Riya", last: "Kapoor", dob: new Date(2003, 11, 30) },      // 30-12-2003
  { first: "Dhruv", last: "Chauhan", dob: new Date(2004, 0, 7) },      // 07-01-2004
  { first: "Nisha", last: "Menon", dob: new Date(2003, 6, 19) },       // 19-07-2003
  { first: "Arnav", last: "Tiwari", dob: new Date(2004, 3, 23) },      // 23-04-2004
  { first: "Siya", last: "Pandey", dob: new Date(2004, 10, 4) },       // 04-11-2004
  { first: "Yash", last: "Agarwal", dob: new Date(2003, 4, 28) },      // 28-05-2003
  { first: "Pooja", last: "Saxena", dob: new Date(2004, 9, 13) },      // 13-10-2004
  { first: "Dev", last: "Mishra", dob: new Date(2003, 1, 6) },         // 06-02-2003
  { first: "Sneha", last: "Banerjee", dob: new Date(2004, 5, 21) },    // 21-06-2004
  { first: "Krish", last: "Shetty", dob: new Date(2003, 8, 10) },      // 10-09-2003
  { first: "Aisha", last: "Khan", dob: new Date(2004, 11, 2) },        // 02-12-2004
  { first: "Shaurya", last: "Dubey", dob: new Date(2003, 3, 17) },     // 17-04-2003
  { first: "Neha", last: "Kulkarni", dob: new Date(2004, 7, 26) },     // 26-08-2004
  { first: "Parth", last: "Mehta", dob: new Date(2003, 10, 8) },       // 08-11-2003
  { first: "Avni", last: "Trivedi", dob: new Date(2004, 0, 19) },      // 19-01-2004
  { first: "Laksh", last: "Verma", dob: new Date(2003, 6, 31) },       // 31-07-2003
  { first: "Tanvi", last: "Bhatt", dob: new Date(2004, 4, 15) },       // 15-05-2004
  { first: "Rudra", last: "Chopra", dob: new Date(2003, 2, 24) },      // 24-03-2003
  { first: "Myra", last: "Das", dob: new Date(2004, 8, 7) },           // 07-09-2004
  { first: "Atharv", last: "Goswami", dob: new Date(2003, 0, 11) },    // 11-01-2003
  { first: "Kiara", last: "Sinha", dob: new Date(2004, 11, 20) },      // 20-12-2004
  { first: "Advait", last: "Patil", dob: new Date(2003, 5, 3) },       // 03-06-2003
  { first: "Zara", last: "Mukherjee", dob: new Date(2004, 3, 29) },    // 29-04-2004
  { first: "Siddharth", last: "Rajan", dob: new Date(2003, 9, 14) },   // 14-10-2003
  { first: "Ira", last: "Hegde", dob: new Date(2004, 1, 8) },          // 08-02-2004
  { first: "Harsh", last: "Bajaj", dob: new Date(2003, 7, 22) },       // 22-08-2003
  { first: "Navya", last: "Reddy", dob: new Date(2004, 6, 5) },        // 05-07-2004
  { first: "Om", last: "Shukla", dob: new Date(2003, 4, 16) },         // 16-05-2003
  { first: "Trisha", last: "Sen", dob: new Date(2004, 10, 28) },       // 28-11-2004
  { first: "Kartik", last: "Thakur", dob: new Date(2003, 2, 9) },      // 09-03-2003
  { first: "Aditi", last: "Ghosh", dob: new Date(2004, 8, 1) },        // 01-09-2004
  { first: "Raghav", last: "Dixit", dob: new Date(2003, 11, 12) },     // 12-12-2003
  { first: "Mansi", last: "Yadav", dob: new Date(2004, 5, 24) },       // 24-06-2004
  { first: "Varun", last: "Jain", dob: new Date(2003, 0, 18) },        // 18-01-2003
];

// 10 Faculty — email = firstname.lastname@campusone.com
const FACULTY_NAMES = [
  { first: "Rajesh", last: "Sharma", dob: new Date(1975, 3, 10), designation: "Professor", qualification: "Ph.D. Computer Science", specialization: "Artificial Intelligence" },
  { first: "Sunita", last: "Verma", dob: new Date(1978, 7, 25), designation: "Associate Professor", qualification: "Ph.D. Information Technology", specialization: "Database Systems" },
  { first: "Amit", last: "Khanna", dob: new Date(1972, 0, 15), designation: "Professor", qualification: "Ph.D. Computer Engineering", specialization: "Computer Networks" },
  { first: "Deepa", last: "Krishnan", dob: new Date(1980, 5, 8), designation: "Assistant Professor", qualification: "Ph.D. Computer Science", specialization: "Operating Systems" },
  { first: "Manish", last: "Gupta", dob: new Date(1976, 10, 20), designation: "Associate Professor", qualification: "Ph.D. Mathematics", specialization: "Discrete Mathematics" },
  { first: "Swati", last: "Joshi", dob: new Date(1982, 2, 3), designation: "Assistant Professor", qualification: "M.Tech. Software Engineering", specialization: "Software Engineering" },
  { first: "Vikram", last: "Rao", dob: new Date(1970, 8, 12), designation: "Professor", qualification: "Ph.D. Computer Science", specialization: "Machine Learning" },
  { first: "Prerna", last: "Mishra", dob: new Date(1984, 6, 30), designation: "Assistant Professor", qualification: "M.Tech. Information Security", specialization: "Cyber Security" },
  { first: "Suresh", last: "Iyer", dob: new Date(1974, 11, 5), designation: "Associate Professor", qualification: "Ph.D. Electronics", specialization: "Embedded Systems" },
  { first: "Kavita", last: "Singh", dob: new Date(1981, 4, 18), designation: "Assistant Professor", qualification: "Ph.D. Computer Science", specialization: "Web Technologies" },
];

// 12 Realistic CS/IT courses
const COURSES = [
  { courseCode: "CS201", name: "Data Structures & Algorithms", department: "Computer Science", credits: 4, semester: 3, description: "Arrays, linked lists, trees, graphs, sorting, searching, and complexity analysis." },
  { courseCode: "CS202", name: "Object Oriented Programming", department: "Computer Science", credits: 4, semester: 3, description: "OOP principles using Java/C++: classes, inheritance, polymorphism, abstraction." },
  { courseCode: "CS301", name: "Database Management Systems", department: "Computer Science", credits: 4, semester: 4, description: "Relational databases, SQL, normalization, transactions, and indexing." },
  { courseCode: "CS302", name: "Operating Systems", department: "Computer Science", credits: 4, semester: 4, description: "Process management, memory management, file systems, and scheduling." },
  { courseCode: "CS303", name: "Computer Networks", department: "Computer Science", credits: 3, semester: 4, description: "OSI model, TCP/IP, routing, switching, and network security." },
  { courseCode: "CS401", name: "Software Engineering", department: "Computer Science", credits: 3, semester: 5, description: "SDLC, Agile, design patterns, testing, and project management." },
  { courseCode: "CS402", name: "Machine Learning", department: "Computer Science", credits: 4, semester: 5, description: "Supervised/unsupervised learning, neural networks, and model evaluation." },
  { courseCode: "CS403", name: "Web Development", department: "Computer Science", credits: 3, semester: 5, description: "HTML, CSS, JavaScript, React, Node.js, and RESTful APIs." },
  { courseCode: "IT201", name: "Discrete Mathematics", department: "Information Technology", credits: 3, semester: 3, description: "Logic, sets, relations, graph theory, and combinatorics." },
  { courseCode: "IT301", name: "Cyber Security", department: "Information Technology", credits: 3, semester: 4, description: "Cryptography, network security, ethical hacking, and security protocols." },
  { courseCode: "IT401", name: "Cloud Computing", department: "Information Technology", credits: 3, semester: 5, description: "Cloud architectures, AWS/Azure, virtualization, and microservices." },
  { courseCode: "IT402", name: "Artificial Intelligence", department: "Information Technology", credits: 4, semester: 5, description: "Search algorithms, knowledge representation, NLP, and expert systems." },
];

// Announcements
const ANNOUNCEMENTS = [
  { title: "Mid-Semester Examination Schedule Released", content: "The mid-semester examination schedule for Semester 4 has been published. Students are requested to check their respective timetables and reach the examination hall 15 minutes before the scheduled time. Carry your ID cards.", priority: "high", targetAudience: "all" },
  { title: "Library Timings Extended During Exam Week", content: "The central library will remain open from 8:00 AM to 11:00 PM during the examination week (April 14–21). Students can access reading rooms, digital resources, and the reference section during these extended hours.", priority: "medium", targetAudience: "students" },
  { title: "Faculty Development Program — AI in Education", content: "A two-day Faculty Development Program on 'Integrating AI Tools in Teaching' will be held on April 25–26. Registration is mandatory. Please sign up through the FDP portal by April 20.", priority: "medium", targetAudience: "faculty" },
  { title: "Campus Placement Drive — Infosys & TCS", content: "Infosys and TCS will conduct on-campus recruitment drives on May 5 and May 8 respectively. Eligible students (CGPA ≥ 7.0, no active backlogs) should register via the Placement Portal before April 28.", priority: "high", targetAudience: "students" },
  { title: "Maintenance: ERP Portal Downtime on April 20", content: "The CampusOne ERP portal will be undergoing scheduled maintenance on April 20, from 2:00 AM to 6:00 AM IST. During this period, all ERP services will be temporarily unavailable. We apologize for the inconvenience.", priority: "low", targetAudience: "all" },
];

// 10 Real Companies for HireSphere
const COMPANIES = [
  {
    name: "Tata Consultancy Services (TCS)",
    role: "Software Developer",
    description: "TCS is hiring graduates for the role of Software Developer. You will work on enterprise-scale projects using Java, Spring Boot, and cloud technologies. The role involves full SDLC participation from design to deployment.\n\nPackage: ₹7.0 LPA | Location: Mumbai, Pune, Hyderabad",
    lastDate: new Date(2026, 4, 15),
    resumeType: "link",
    formQuestions: ["What is your CGPA?"],
  },
  {
    name: "Infosys",
    role: "Systems Engineer",
    description: "Infosys is looking for Systems Engineers to join their Mysuru campus for a 6-month training followed by project allocation. You'll work on cutting-edge digital transformation projects for global clients.\n\nPackage: ₹6.5 LPA | Location: Mysuru, Bengaluru, Pune",
    lastDate: new Date(2026, 4, 20),
    resumeType: "link",
    formQuestions: ["What is your CGPA?"],
  },
  {
    name: "Wipro",
    role: "Project Engineer",
    description: "Wipro is hiring Project Engineers for their Digital & Technology division. The role involves software development, testing, and client communication. Technologies include .NET, Java, Python, and AWS.\n\nPackage: ₹6.0 LPA | Location: Bengaluru, Chennai, Hyderabad",
    lastDate: new Date(2026, 4, 25),
    resumeType: "link",
    formQuestions: ["What is your CGPA?"],
  },
  {
    name: "Google India",
    role: "Software Engineering Intern (SWE Intern)",
    description: "Google is offering a 12-week summer internship for outstanding students. You'll work on real Google products used by billions of users. Strong DSA and problem-solving skills are required.\n\nStipend: ₹1.5L/month | Location: Bengaluru, Hyderabad",
    lastDate: new Date(2026, 5, 1),
    resumeType: "link",
    formQuestions: ["What is your CGPA?"],
  },
  {
    name: "Microsoft India",
    role: "Software Engineer (Full-Time)",
    description: "Microsoft is hiring new graduates for SDE roles across Azure, Office 365, and Teams. You'll build scalable cloud services and user-facing features. Strong CS fundamentals and coding skills required.\n\nPackage: ₹19.0 LPA | Location: Hyderabad, Bengaluru",
    lastDate: new Date(2026, 5, 5),
    resumeType: "link",
    formQuestions: ["What is your CGPA?"],
  },
  {
    name: "Amazon India",
    role: "SDE-1 (Software Development Engineer)",
    description: "Amazon is hiring SDE-1 engineers for their Hyderabad and Bengaluru offices. You'll work on Amazon's retail, AWS, or Alexa platforms. The role requires expertise in data structures, algorithms, and system design.\n\nPackage: ₹16.0 LPA + stocks | Location: Hyderabad, Bengaluru",
    lastDate: new Date(2026, 5, 10),
    resumeType: "link",
    formQuestions: ["What is your CGPA?"],
  },
  {
    name: "Deloitte India",
    role: "Analyst — Technology Consulting",
    description: "Deloitte is hiring Analysts for their Technology Consulting practice. The role involves digital transformation advisory, ERP implementations (SAP/Oracle), and business process optimization for Fortune 500 clients.\n\nPackage: ₹8.5 LPA | Location: Mumbai, Bengaluru, Gurugram",
    lastDate: new Date(2026, 5, 15),
    resumeType: "link",
    formQuestions: ["What is your CGPA?"],
  },
  {
    name: "Zoho Corporation",
    role: "Member Technical Staff",
    description: "Zoho is hiring Member Technical Staff for their Chennai R&D center. You'll build features for Zoho's suite of 50+ business applications. Zoho values problem-solving over frameworks — expect a rigorous coding test.\n\nPackage: ₹8.0 LPA | Location: Chennai",
    lastDate: new Date(2026, 5, 20),
    resumeType: "link",
    formQuestions: ["What is your CGPA?"],
  },
  {
    name: "Accenture India",
    role: "Associate Software Engineer",
    description: "Accenture is hiring Associate Software Engineers for their Advanced Technology Centers. You'll work on full-stack development, cloud migration, and AI/ML projects for global enterprises.\n\nPackage: ₹6.5 LPA | Location: Bengaluru, Pune, Hyderabad, Chennai",
    lastDate: new Date(2026, 5, 25),
    resumeType: "link",
    formQuestions: ["What is your CGPA?"],
  },
  {
    name: "Flipkart",
    role: "SDE-1 (Backend Engineer)",
    description: "Flipkart is looking for backend engineers to work on India's largest e-commerce platform. You'll build scalable microservices handling millions of transactions daily using Java, Kafka, and distributed systems.\n\nPackage: ₹17.5 LPA + stocks | Location: Bengaluru",
    lastDate: new Date(2026, 5, 30),
    resumeType: "link",
    formQuestions: ["What is your CGPA?"],
  },
];


// ════════════════════════════════════════════
// Helper Functions
// ════════════════════════════════════════════

function formatDob(date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}${mm}${yyyy}`;
}

function makeEmail(first, last) {
  return `${first.toLowerCase()}.${last.toLowerCase()}@campusone.com`;
}

function makePassword(first, dob) {
  return `${first.toLowerCase()}@${formatDob(dob)}#`;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomPhone() {
  return "9" + Math.floor(100000000 + Math.random() * 900000000).toString();
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateClassCode() {
  return crypto.randomBytes(3).toString("hex");
}

const THEME_COLORS = [
  "#1967d2", "#1e8e3e", "#e8710a", "#d93025",
  "#9334e6", "#185abc", "#137333", "#b06000",
];

// ════════════════════════════════════════════
// Main Seed Function
// ════════════════════════════════════════════

async function seedERP() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB for ERP seeding.\n");

    // ───────────────────────────────────────
    // Step 1: Create User Accounts (name-based emails, unique passwords)
    // ───────────────────────────────────────
    console.log("👤 Creating user accounts with name-based emails...");

    // Delete ALL existing users to avoid email conflicts from old seed
    await User.deleteMany({});

    // Admin account (unchanged)
    const adminUser = await User.create({
      name: "Campus Administrator",
      email: "admin@campusone.com",
      role: "admin",
      password: "admin@campusone#",  // pre-save hook will hash this
    });

    // Faculty accounts
    const facultyUsers = [];
    const facultyCredentials = [];
    for (const f of FACULTY_NAMES) {
      const email = makeEmail(f.first, f.last);
      const rawPassword = makePassword(f.first, f.dob);
      const user = await User.create({
        name: `Dr. ${f.first} ${f.last}`,
        email,
        role: "faculty",
        password: rawPassword,  // pre-save hook will hash this
      });
      facultyUsers.push(user);
      facultyCredentials.push({ email, password: rawPassword });
    }

    // Student accounts
    const studentUsers = [];
    const studentCredentials = [];
    for (const s of STUDENT_NAMES) {
      const email = makeEmail(s.first, s.last);
      const rawPassword = makePassword(s.first, s.dob);
      const user = await User.create({
        name: `${s.first} ${s.last}`,
        email,
        role: "student",
        password: rawPassword,  // pre-save hook will hash this
      });
      studentUsers.push(user);
      studentCredentials.push({ email, password: rawPassword });
    }

    console.log(`   ✅ ${studentUsers.length} student accounts created`);
    console.log(`   ✅ ${facultyUsers.length} faculty accounts created`);
    console.log(`   ✅ 1 admin account created`);

    // ───────────────────────────────────────
    // Step 2: Clear existing ERP + Classroom + HireSphere data
    // ───────────────────────────────────────
    console.log("\n🗑️  Clearing existing data...");
    await Student.deleteMany({});
    await Faculty.deleteMany({});
    await Admin.deleteMany({});
    await Course.deleteMany({});
    await StudentCourse.deleteMany({});
    await FacultyCourse.deleteMany({});
    await Fee.deleteMany({});
    await Attendance.deleteMany({});
    await Timetable.deleteMany({});
    await Exam.deleteMany({});
    await ExamResult.deleteMany({});
    await Announcement.deleteMany({});
    await Classroom.deleteMany({});
    await Enrollment.deleteMany({});
    await Post.deleteMany({});
    await Company.deleteMany({});
    console.log("   ✅ All collections cleared");

    // ───────────────────────────────────────
    // Step 3: Create Admin Profile
    // ───────────────────────────────────────
    console.log("\n🛡️  Creating admin profile...");
    await Admin.create({
      userId: adminUser._id,
      firstName: "Campus",
      lastName: "Administrator",
      employeeId: "ADM-001",
      department: "Administration",
      designation: "Chief Administrator",
      phone: randomPhone(),
    });
    console.log("   ✅ Admin profile created");

    // ───────────────────────────────────────
    // Step 4: Create Faculty Profiles
    // ───────────────────────────────────────
    console.log("\n👨‍🏫 Creating faculty profiles...");
    const facultyDocs = [];

    for (let i = 0; i < FACULTY_NAMES.length; i++) {
      const f = FACULTY_NAMES[i];
      const doc = await Faculty.create({
        userId: facultyUsers[i]._id,
        firstName: f.first,
        lastName: f.last,
        employeeId: `FAC-${String(i + 1).padStart(3, "0")}`,
        department: i < 8 ? "Computer Science" : "Information Technology",
        designation: f.designation,
        qualification: f.qualification,
        specialization: f.specialization,
        dateOfBirth: f.dob,
        gender: ["Rajesh", "Amit", "Manish", "Vikram", "Suresh"].includes(f.first) ? "male" : "female",
        phone: randomPhone(),
        address: `${randomInt(1, 500)}, Faculty Quarters, CampusOne University`,
        joiningDate: randomDate(new Date(2015, 0, 1), new Date(2023, 11, 31)),
      });
      facultyDocs.push(doc);
    }
    console.log(`   ✅ ${facultyDocs.length} faculty profiles created`);

    // ───────────────────────────────────────
    // Step 5: Create Student Profiles
    // ───────────────────────────────────────
    console.log("\n🎓 Creating student profiles...");
    const studentDocs = [];

    for (let i = 0; i < STUDENT_NAMES.length; i++) {
      const s = STUDENT_NAMES[i];
      const isMsc = i < 25;
      const semester = 2; // Assuming batch started in 2025
      
      const department = isMsc ? "Information Technology" : "Information and Communication Technology";
      const program = isMsc ? "M.Sc(IT)" : "B.Tech (ICT)";
      const batch = isMsc ? "2025-27" : "2025-29";
      
      const enrollPrefix = isMsc ? "202512" : "202511";
      const enrollNumber = enrollPrefix + String(51 + (isMsc ? i : i - 25)).padStart(3, "0");

      const doc = await Student.create({
        userId: studentUsers[i]._id,
        firstName: s.first,
        lastName: s.last,
        enrollmentNo: enrollNumber,
        department: department,
        program: program,
        semester,
        batch: batch,
        dateOfBirth: s.dob,
        gender: ["Priyanshu", "Jay", "Moksh", "Durgesh", "Rohit", "Ishaan", "Arjun", "Reyansh", "Aditya", "Vihaan", "Kabir", "Dhruv", "Arnav", "Yash", "Dev", "Krish", "Shaurya", "Parth", "Laksh", "Rudra", "Atharv", "Advait", "Siddharth", "Harsh", "Om", "Kartik", "Raghav", "Varun"].includes(s.first) ? "male" : "female",
        phone: randomPhone(),
        address: `${randomInt(1, 999)}, ${randomFrom(["Sector", "Block", "Wing"])} ${randomFrom(["A", "B", "C", "D"])}, ${randomFrom(["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai", "Ahmedabad", "Jaipur"])}`,
        guardianName: `${randomFrom(["Mr.", "Mrs."])} ${randomFrom(["Patel", "Sharma", "Gupta", "Singh", "Kumar", "Verma", "Reddy", "Nair", "Iyer", "Joshi"])}`,
        guardianPhone: randomPhone(),
      });
      studentDocs.push(doc);
    }
    console.log(`   ✅ ${studentDocs.length} student profiles created`);

    // ───────────────────────────────────────
    // Step 6: Create Courses
    // ───────────────────────────────────────
    console.log("\n📚 Creating courses...");
    const courseDocs = await Course.insertMany(COURSES);
    console.log(`   ✅ ${courseDocs.length} courses created`);

    // ───────────────────────────────────────
    // Step 7: Assign Faculty to Courses
    // ───────────────────────────────────────
    console.log("\n🔗 Assigning faculty to courses...");
    const facultyCourseAssignments = [
      { facultyIdx: 0, courseIdx: [6, 11] },   // Rajesh → ML, AI
      { facultyIdx: 1, courseIdx: [2] },         // Sunita → DBMS
      { facultyIdx: 2, courseIdx: [4] },         // Amit → Networks
      { facultyIdx: 3, courseIdx: [3] },         // Deepa → OS
      { facultyIdx: 4, courseIdx: [8] },         // Manish → Discrete Math
      { facultyIdx: 5, courseIdx: [5] },         // Swati → SE
      { facultyIdx: 6, courseIdx: [0, 1] },      // Vikram → DSA, OOP
      { facultyIdx: 7, courseIdx: [9] },         // Prerna → Cyber Security
      { facultyIdx: 8, courseIdx: [10] },        // Suresh → Cloud
      { facultyIdx: 9, courseIdx: [7] },         // Kavita → Web Dev
    ];

    const fcDocs = [];
    for (const assignment of facultyCourseAssignments) {
      for (const cIdx of assignment.courseIdx) {
        fcDocs.push({
          facultyId: facultyDocs[assignment.facultyIdx]._id,
          courseId: courseDocs[cIdx]._id,
        });
      }
    }
    await FacultyCourse.insertMany(fcDocs);
    console.log(`   ✅ ${fcDocs.length} faculty-course assignments created`);

    // ───────────────────────────────────────
    // Step 8: Enroll Students in Courses
    // ───────────────────────────────────────
    console.log("\n📝 Enrolling students in courses...");
    const scDocs = [];
    const semesterCourseMap = {
      "Computer Science_3": [0, 1, 8],
      "Computer Science_4": [2, 3, 4],
      "Computer Science_5": [5, 6, 7],
      "Information Technology_3": [0, 1, 8],
      "Information Technology_4": [2, 3, 9],
      "Information Technology_5": [5, 10, 11],
    };

    for (const student of studentDocs) {
      const key = `${student.department}_${student.semester}`;
      const courseIndices = semesterCourseMap[key] || [0, 1, 2];
      for (const cIdx of courseIndices) {
        scDocs.push({ studentId: student._id, courseId: courseDocs[cIdx]._id, status: "enrolled" });
      }
    }
    await StudentCourse.insertMany(scDocs);
    console.log(`   ✅ ${scDocs.length} student-course enrollments created`);

    // ───────────────────────────────────────
    // Step 9: Create Timetable
    // ───────────────────────────────────────
    console.log("\n📅 Creating timetable...");
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const timeSlots = [
      { start: "09:00", end: "10:00" }, { start: "10:15", end: "11:15" },
      { start: "11:30", end: "12:30" }, { start: "14:00", end: "15:00" },
      { start: "15:15", end: "16:15" },
    ];
    const rooms = ["LH-101", "LH-102", "LH-103", "LH-201", "LH-202", "Lab-A1", "Lab-A2", "Lab-B1"];
    const timetableDocs = [];
    let slotIdx = 0;

    for (let cIdx = 0; cIdx < courseDocs.length; cIdx++) {
      const fcAssignment = fcDocs.find((fc) => fc.courseId.toString() === courseDocs[cIdx]._id.toString());
      if (!fcAssignment) continue;
      const day1 = days[slotIdx % 5]; const slot1 = timeSlots[Math.floor(slotIdx / 5) % 5]; slotIdx++;
      const day2 = days[slotIdx % 5]; const slot2 = timeSlots[Math.floor(slotIdx / 5) % 5]; slotIdx++;
      timetableDocs.push({ courseId: courseDocs[cIdx]._id, facultyId: fcAssignment.facultyId, day: day1, startTime: slot1.start, endTime: slot1.end, room: rooms[cIdx % rooms.length], type: "lecture" });
      timetableDocs.push({ courseId: courseDocs[cIdx]._id, facultyId: fcAssignment.facultyId, day: day2, startTime: slot2.start, endTime: slot2.end, room: rooms[(cIdx + 4) % rooms.length], type: cIdx % 3 === 0 ? "lab" : "tutorial" });
    }
    await Timetable.insertMany(timetableDocs);
    console.log(`   ✅ ${timetableDocs.length} timetable entries created`);

    // ───────────────────────────────────────
    // Step 10: Create Fee Records
    // ───────────────────────────────────────
    console.log("\n💰 Creating fee records...");
    const feeDocs = [];
    for (const student of studentDocs) {
      const currentStatus = randomFrom(["paid", "paid", "paid", "partial", "unpaid"]);
      const totalAmount = 85000;
      let paidAmount = 0;
      if (currentStatus === "paid") paidAmount = totalAmount;
      else if (currentStatus === "partial") paidAmount = randomInt(30000, 60000);
      feeDocs.push({ studentId: student._id, semester: student.semester, totalAmount, paidAmount, dueDate: new Date(2026, 3, 30), status: currentStatus, paidDate: currentStatus === "paid" ? randomDate(new Date(2026, 0, 15), new Date(2026, 2, 15)) : null, transactionId: currentStatus !== "unpaid" ? `TXN${Date.now()}${randomInt(1000, 9999)}` : null, description: "Tuition Fee" });
      feeDocs.push({ studentId: student._id, semester: student.semester - 1 > 0 ? student.semester - 1 : 1, totalAmount: 82000, paidAmount: 82000, dueDate: new Date(2025, 9, 30), status: "paid", paidDate: randomDate(new Date(2025, 7, 1), new Date(2025, 9, 15)), transactionId: `TXN${Date.now()}${randomInt(1000, 9999)}`, description: "Tuition Fee" });
    }
    await Fee.insertMany(feeDocs);
    console.log(`   ✅ ${feeDocs.length} fee records created`);

    // ───────────────────────────────────────
    // Step 11: Create Attendance Records
    // ───────────────────────────────────────
    console.log("\n📊 Creating attendance records...");
    const attendanceDocs = [];
    for (const student of studentDocs) {
      const key = `${student.department}_${student.semester}`;
      const courseIndices = semesterCourseMap[key] || [0, 1, 2];
      for (const cIdx of courseIndices) {
        const fcAssignment = fcDocs.find((fc) => fc.courseId.toString() === courseDocs[cIdx]._id.toString());
        for (let week = 1; week <= 8; week++) {
          for (let classNum = 0; classNum < 2; classNum++) {
            const baseDate = new Date(2026, 0, 13);
            const classDate = new Date(baseDate);
            classDate.setDate(baseDate.getDate() + (week - 1) * 7 + classNum * 2);
            const roll = Math.random();
            let status = roll < 0.80 ? "present" : roll < 0.85 ? "late" : "absent";
            attendanceDocs.push({ studentId: student._id, courseId: courseDocs[cIdx]._id, date: classDate, status, weekNumber: week, markedBy: fcAssignment ? fcAssignment.facultyId : facultyDocs[0]._id });
          }
        }
      }
    }
    const BATCH_SIZE = 500;
    for (let i = 0; i < attendanceDocs.length; i += BATCH_SIZE) {
      await Attendance.insertMany(attendanceDocs.slice(i, i + BATCH_SIZE));
    }
    console.log(`   ✅ ${attendanceDocs.length} attendance records created`);

    // ───────────────────────────────────────
    // Step 12: Create Exams & Results
    // ───────────────────────────────────────
    console.log("\n📝 Creating exams...");
    const examDocs = [];
    for (const course of courseDocs) {
      examDocs.push({ courseId: course._id, name: `${course.name} - Midterm`, type: "midterm", date: randomDate(new Date(2026, 2, 1), new Date(2026, 2, 15)), totalMarks: 30, duration: 90 });
      examDocs.push({ courseId: course._id, name: `${course.name} - Endterm`, type: "endterm", date: randomDate(new Date(2026, 4, 1), new Date(2026, 4, 20)), totalMarks: 70, duration: 180 });
    }
    const examDocsCreated = await Exam.insertMany(examDocs);
    console.log(`   ✅ ${examDocsCreated.length} exams created`);

    console.log("\n📈 Creating exam results...");
    const resultDocs = [];
    const midtermExams = examDocsCreated.filter((e) => e.type === "midterm");
    for (const exam of midtermExams) {
      const enrolledStudents = scDocs.filter((sc) => sc.courseId.toString() === exam.courseId.toString());
      for (const enrollment of enrolledStudents) {
        const marks = randomInt(8, 28);
        const pct = (marks / 30) * 100;
        const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B+" : pct >= 60 ? "B" : pct >= 50 ? "C" : pct >= 40 ? "D" : "F";
        resultDocs.push({ examId: exam._id, studentId: enrollment.studentId, marksObtained: marks, grade, remarks: pct >= 70 ? "Good performance" : pct >= 50 ? "Average" : "Needs improvement" });
      }
    }
    for (let i = 0; i < resultDocs.length; i += BATCH_SIZE) {
      await ExamResult.insertMany(resultDocs.slice(i, i + BATCH_SIZE));
    }
    console.log(`   ✅ ${resultDocs.length} exam results created`);

    // ───────────────────────────────────────
    // Step 13: Create Announcements
    // ───────────────────────────────────────
    console.log("\n📢 Creating announcements...");
    await Announcement.insertMany(ANNOUNCEMENTS.map((a) => ({ ...a, author: adminUser._id })));
    console.log(`   ✅ ${ANNOUNCEMENTS.length} announcements created`);

    // ───────────────────────────────────────
    // Step 14: Create Classrooms (faculty creates, students join)
    // ───────────────────────────────────────
    console.log("\n🏫 Creating classrooms...");

    // Each faculty creates a classroom for each course they teach
    // Then students enrolled in that course auto-join
    const classroomDocs = [];
    const enrollmentDocs = [];
    const postDocs = [];

    for (const assignment of facultyCourseAssignments) {
      for (const cIdx of assignment.courseIdx) {
        const course = courseDocs[cIdx];
        const faculty = facultyUsers[assignment.facultyIdx];
        const facultyDoc = facultyDocs[assignment.facultyIdx];

        const classroom = await Classroom.create({
          name: course.name,
          section: `${course.courseCode} — Sem ${course.semester}`,
          subject: course.courseCode,
          description: course.description,
          facultyId: faculty._id,
          code: generateClassCode(),
          themeColor: THEME_COLORS[cIdx % THEME_COLORS.length],
        });
        classroomDocs.push(classroom);

        // Enroll all students who are taking this course
        const enrolledStudents = scDocs.filter(
          (sc) => sc.courseId.toString() === course._id.toString()
        );

        for (const enrollment of enrolledStudents) {
          // Find the User ID for this student
          const studentDoc = studentDocs.find(
            (sd) => sd._id.toString() === enrollment.studentId.toString()
          );
          if (!studentDoc) continue;

          enrollmentDocs.push({
            classroomId: classroom._id,
            studentId: studentDoc.userId, // Enrollment uses User._id, not Student._id
          });
        }

        // Create a welcome announcement post
        postDocs.push({
          classroomId: classroom._id,
          authorId: faculty._id,
          title: `Welcome to ${course.name}`,
          content: `Welcome to ${course.courseCode} — ${course.name}! This is your classroom for Semester ${course.semester}. All materials, assignments, and announcements will be posted here.\n\nInstructor: Dr. ${FACULTY_NAMES[assignment.facultyIdx].first} ${FACULTY_NAMES[assignment.facultyIdx].last}`,
          type: "announcement",
        });

        // Create a material post
        postDocs.push({
          classroomId: classroom._id,
          authorId: faculty._id,
          title: `${course.name} — Course Syllabus & Plan`,
          content: `The detailed syllabus and weekly lecture plan for ${course.courseCode} has been uploaded. Please go through it and prepare accordingly.\n\nTopics covered: ${course.description}`,
          type: "material",
        });

        // Create an assignment post
        postDocs.push({
          classroomId: classroom._id,
          authorId: faculty._id,
          title: `Assignment 1 — ${course.name}`,
          content: `Submit your first assignment covering the topics discussed in Weeks 1–4. Follow the university format for submissions. Late submissions will incur a 10% penalty per day.`,
          type: "assignment",
          dueDate: new Date(2026, 3, 25),
          totalPoints: 100,
        });
      }
    }

    // Insert enrollments in batches
    for (let i = 0; i < enrollmentDocs.length; i += BATCH_SIZE) {
      await Enrollment.insertMany(enrollmentDocs.slice(i, i + BATCH_SIZE));
    }
    await Post.insertMany(postDocs);

    console.log(`   ✅ ${classroomDocs.length} classrooms created`);
    console.log(`   ✅ ${enrollmentDocs.length} student enrollments in classrooms`);
    console.log(`   ✅ ${postDocs.length} posts created (announcements, materials, assignments)`);

    // ───────────────────────────────────────
    // Step 15: Create HireSphere Company Listings
    // ───────────────────────────────────────
    console.log("\n💼 Creating HireSphere company listings...");
    const companyDocs = COMPANIES.map((c) => ({
      ...c,
      createdByAdmin: adminUser._id,
    }));
    await Company.insertMany(companyDocs);
    console.log(`   ✅ ${companyDocs.length} companies listed`);

    // ═══════════════════════════════════════
    // Summary
    // ═══════════════════════════════════════
    console.log("\n" + "═".repeat(60));
    console.log("🎉 COMPLETE SEEDING FINISHED SUCCESSFULLY!");
    console.log("═".repeat(60));
    console.log(`
   📊 Summary:
   ┌──────────────────────────────────┬────────┐
   │ Collection                       │ Count  │
   ├──────────────────────────────────┼────────┤
   │ User Accounts                    │ ${(studentUsers.length + facultyUsers.length + 1).toString().padEnd(6)} │
   │ Student Profiles                 │ ${studentDocs.length.toString().padEnd(6)} │
   │ Faculty Profiles                 │ ${facultyDocs.length.toString().padEnd(6)} │
   │ Admin Profiles                   │ 1      │
   │ Courses                          │ ${courseDocs.length.toString().padEnd(6)} │
   │ Faculty-Course Assignments       │ ${fcDocs.length.toString().padEnd(6)} │
   │ Student-Course Enrollments       │ ${scDocs.length.toString().padEnd(6)} │
   │ Fee Records                      │ ${feeDocs.length.toString().padEnd(6)} │
   │ Attendance Records               │ ${attendanceDocs.length.toString().padEnd(6)} │
   │ Timetable Entries                │ ${timetableDocs.length.toString().padEnd(6)} │
   │ Exams                            │ ${examDocsCreated.length.toString().padEnd(6)} │
   │ Exam Results                     │ ${resultDocs.length.toString().padEnd(6)} │
   │ Announcements                    │ ${ANNOUNCEMENTS.length.toString().padEnd(6)} │
   │ Classrooms                       │ ${classroomDocs.length.toString().padEnd(6)} │
   │ Classroom Enrollments            │ ${enrollmentDocs.length.toString().padEnd(6)} │
   │ Classroom Posts                  │ ${postDocs.length.toString().padEnd(6)} │
   │ HireSphere Companies             │ ${companyDocs.length.toString().padEnd(6)} │
   └──────────────────────────────────┴────────┘
    `);

    // Print credentials
    console.log("   🔑 ADMIN ACCOUNT:");
    console.log(`   │ admin@campusone.com │ admin@campusone# │\n`);

    console.log("   🔑 FACULTY ACCOUNTS (first 5 shown):");
    console.log("   ┌──────────────────────────────────────┬───────────────────────────┐");
    facultyCredentials.slice(0, 5).forEach((c) => {
      console.log(`   │ ${c.email.padEnd(36)} │ ${c.password.padEnd(25)} │`);
    });
    console.log(`   │ ... and ${facultyCredentials.length - 5} more faculty              │                           │`);
    console.log("   └──────────────────────────────────────┴───────────────────────────┘\n");

    console.log("   🔑 STUDENT ACCOUNTS (first 5 shown):");
    console.log("   ┌──────────────────────────────────────┬───────────────────────────┐");
    studentCredentials.slice(0, 5).forEach((c) => {
      console.log(`   │ ${c.email.padEnd(36)} │ ${c.password.padEnd(25)} │`);
    });
    console.log(`   │ ... and ${studentCredentials.length - 5} more students              │                           │`);
    console.log("   └──────────────────────────────────────┴───────────────────────────┘\n");

    console.log("   📧 Pattern: firstname.lastname@campusone.com");
    console.log("   🔐 Pattern: firstname@DDMMYYYY#\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seed failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

seedERP();
