const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const dns = require("dns");

dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({ path: path.join(__dirname, "..", ".env") });
const Company = require("./models/Company");

const UPDATED_COMPANIES = [
  { name: "Tata Consultancy Services (TCS)", description: "TCS is hiring graduates for the role of Software Developer. You will work on enterprise-scale projects using Java, Spring Boot, and cloud technologies. The role involves full SDLC participation from design to deployment.\n\nPackage: ₹7.0 LPA | Location: Mumbai, Pune, Hyderabad" },
  { name: "Infosys", description: "Infosys is looking for Systems Engineers to join their Mysuru campus for a 6-month training followed by project allocation. You'll work on cutting-edge digital transformation projects for global clients.\n\nPackage: ₹6.5 LPA | Location: Mysuru, Bengaluru, Pune" },
  { name: "Wipro", description: "Wipro is hiring Project Engineers for their Digital & Technology division. The role involves software development, testing, and client communication. Technologies include .NET, Java, Python, and AWS.\n\nPackage: ₹6.0 LPA | Location: Bengaluru, Chennai, Hyderabad" },
  { name: "Google India", description: "Google is offering a 12-week summer internship for outstanding students. You'll work on real Google products used by billions of users. Strong DSA and problem-solving skills are required.\n\nStipend: ₹1.5L/month | Location: Bengaluru, Hyderabad" },
  { name: "Microsoft India", description: "Microsoft is hiring new graduates for SDE roles across Azure, Office 365, and Teams. You'll build scalable cloud services and user-facing features. Strong CS fundamentals and coding skills required.\n\nPackage: ₹19.0 LPA | Location: Hyderabad, Bengaluru" },
  { name: "Amazon India", description: "Amazon is hiring SDE-1 engineers for their Hyderabad and Bengaluru offices. You'll work on Amazon's retail, AWS, or Alexa platforms. The role requires expertise in data structures, algorithms, and system design.\n\nPackage: ₹16.0 LPA + stocks | Location: Hyderabad, Bengaluru" },
  { name: "Deloitte India", description: "Deloitte is hiring Analysts for their Technology Consulting practice. The role involves digital transformation advisory, ERP implementations (SAP/Oracle), and business process optimization for Fortune 500 clients.\n\nPackage: ₹8.5 LPA | Location: Mumbai, Bengaluru, Gurugram" },
  { name: "Zoho Corporation", description: "Zoho is hiring Member Technical Staff for their Chennai R&D center. You'll build features for Zoho's suite of 50+ business applications. Zoho values problem-solving over frameworks — expect a rigorous coding test.\n\nPackage: ₹8.0 LPA | Location: Chennai" },
  { name: "Accenture India", description: "Accenture is hiring Associate Software Engineers for their Advanced Technology Centers. You'll work on full-stack development, cloud migration, and AI/ML projects for global enterprises.\n\nPackage: ₹6.5 LPA | Location: Bengaluru, Pune, Hyderabad, Chennai" },
  { name: "Flipkart", description: "Flipkart is looking for backend engineers to work on India's largest e-commerce platform. You'll build scalable microservices handling millions of transactions daily using Java, Kafka, and distributed systems.\n\nPackage: ₹17.5 LPA + stocks | Location: Bengaluru" },
];

async function updateDescriptions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    for (const c of UPDATED_COMPANIES) {
      const result = await Company.updateOne(
        { name: c.name },
        { $set: { description: c.description } }
      );
      console.log(`  ${result.modifiedCount > 0 ? "✅" : "⚠️ "} ${c.name}`);
    }

    console.log("\n🎉 All company descriptions updated — eligibility lines removed.");
  } catch (err) {
    console.error("❌ Failed:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

updateDescriptions();
