const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hostel";

async function cleanup() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected!");

    // Delete all bookings for 24b11cs135
    const result = await mongoose.connection.collection("bookings").deleteMany({
      studentRollNo: "24b11cs135"
    });

    console.log(`\n🗑️ Deleted ${result.deletedCount} bookings for student 24b11cs135`);

    // Show remaining bookings
    const remainingBookings = await mongoose.connection.collection("bookings").find({}).toArray();
    console.log(`\n📊 Remaining bookings: ${remainingBookings.length}`);
    
    if (remainingBookings.length > 0) {
      console.log("\nRemaining bookings:");
      remainingBookings.forEach(booking => {
        console.log(`  - ${booking.studentRollNo}: ${booking.type} (${booking.status})`);
      });
    } else {
      console.log("✅ All bookings have been cleaned up!");
    }

    console.log("\n✅ Cleanup complete!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    // CLOSE CONNECTION PROPERLY
    await mongoose.connection.close();
    process.exit(0);
  }
}

cleanup();