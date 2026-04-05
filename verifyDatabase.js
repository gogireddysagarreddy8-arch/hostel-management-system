const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hostelDB";

async function verify() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected!");
    console.log(`📊 Current Database: ${mongoose.connection.name}`);

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("\n📁 Collections found:");
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });

    // Check users collection
    const usersCollection = mongoose.connection.collection("users");
    const userCount = await usersCollection.countDocuments();
    console.log(`\n👥 Total users in collection: ${userCount}`);

    if (userCount > 0) {
      const users = await usersCollection.find({}).toArray();
      console.log("\n📋 User Details:");
      users.forEach((user, index) => {
        console.log(`\n  User ${index + 1}:`);
        console.log(`    - ID: ${user._id}`);
        console.log(`    - Roll No: ${user.rollNo}`);
        console.log(`    - Role: ${user.role}`);
        console.log(`    - Password Hash: ${user.password.substring(0, 20)}...`);
      });
    } else {
      console.log("\n⚠️  No users found in database!");
      console.log("   Try registering a new student first.");
    }

    console.log("\n✅ Verification complete!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    // CLOSE CONNECTION PROPERLY
    await mongoose.connection.close();
    process.exit(0);
  }
}

verify();