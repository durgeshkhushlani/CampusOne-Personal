const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { BSON } = require("bson");

// Load environment variables from root .env
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const Problem = require("./models/Problem");

/**
 * Import CodeStage problems from a BSON dump file.
 *
 * This script reads the raw .bson dump, parses each document,
 * maps it to match the CampusOne Problem schema, and inserts
 * into the connected MongoDB (works with both local and Atlas).
 *
 * Usage: node importProblems.js
 */

// Path to the BSON dump file
const BSON_FILE = path.join(__dirname, "..", "..", "dump", "dbname", "problems.bson");

/**
 * Parse a concatenated BSON file into an array of JS objects.
 * mongodump produces files that are just BSON documents back-to-back.
 */
function parseBsonFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  const documents = [];
  let offset = 0;

  while (offset < buffer.length) {
    // First 4 bytes of each BSON doc = int32 document size
    const docSize = buffer.readInt32LE(offset);
    if (docSize <= 0 || offset + docSize > buffer.length) break;

    const docBuffer = buffer.slice(offset, offset + docSize);
    const doc = BSON.deserialize(docBuffer);
    documents.push(doc);
    offset += docSize;
  }

  return documents;
}

async function importProblems() {
  try {
    // Check if dump file exists
    if (!fs.existsSync(BSON_FILE)) {
      console.error(`❌ BSON file not found at: ${BSON_FILE}`);
      console.error(`   Make sure the dump folder is at the expected location.`);
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB:", process.env.MONGO_URI.replace(/\/\/.*@/, "//<credentials>@"));

    // Parse BSON file
    console.log("\n📄 Parsing problems.bson...");
    const rawDocs = parseBsonFile(BSON_FILE);
    console.log(`   Found ${rawDocs.length} problems in dump`);

    if (rawDocs.length === 0) {
      console.log("⚠️  No problems found in dump. Exiting.");
      process.exit(0);
    }

    // Preview the problems
    console.log("\n📋 Problems found:");
    rawDocs.forEach((doc, i) => {
      console.log(`   ${i + 1}. ${doc.title} [${doc.difficulty}] — ${doc.testCases?.length || 0} test cases`);
    });

    // Map dump documents to our Problem schema
    const problemDocs = rawDocs.map((doc) => ({
      title: doc.title,
      difficulty: doc.difficulty,
      description: doc.description,
      sampleInput: doc.sampleInput || "",
      sampleOutput: doc.sampleOutput || "",
      testCases: (doc.testCases || []).map((tc) => ({
        input: tc.input || "",
        output: tc.output || "",
        isHidden: tc.isHidden || false,
      })),
    }));

    // Clear existing problems and insert new ones
    console.log("\n🗑️  Clearing existing problems...");
    await Problem.deleteMany({});

    console.log("📥 Inserting problems...");
    const inserted = await Problem.insertMany(problemDocs);
    console.log(`\n✅ Successfully imported ${inserted.length} problems!`);

    console.log("\n" + "═".repeat(50));
    console.log("🎉 CODESTAGE PROBLEMS IMPORT COMPLETE!");
    console.log("═".repeat(50));
    console.log(`\n   ${inserted.length} coding problems are now available.`);
    console.log("   Students can view them in the CodeStage module.\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Import failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

importProblems();
