const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const roomRoutes = require("./routes/roomRoutes");

const Room = require("./models/Room");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/rooms", roomRoutes);

// Health check
app.get("/", (req, res) => res.send("Hostel Management API is running..."));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({ 
    error: err.message || "Internal Server Error" 
  });
});

// Database Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hostelDB";

console.log("🔗 MongoDB URI:", MONGO_URI);

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected Successfully!");
    console.log("📊 Connected to database:", mongoose.connection.name);
    
    // List collections
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log("📁 Collections in database:", collections.map(c => c.name).join(", "));
    } catch (err) {
      console.error("Error listing collections:", err.message);
    }

    // Initialize rooms
    try {
      const roomCount = await Room.countDocuments();
      if (roomCount === 0) {
        console.log("🔧 Initializing rooms...");
        const floors = [1, 2, 3];
        const roomsPerFloor = 5;
        
        const roomsToCreate = [];
        for (let floor of floors) {
          for (let room = 1; room <= roomsPerFloor; room++) {
            const roomNo = `${floor}0${room}`;
            roomsToCreate.push({
              roomNumber: roomNo,
              capacity: 2,
              available: true
            });
          }
        }

        await Room.insertMany(roomsToCreate);
        console.log(`✅ Created ${roomsToCreate.length} rooms!`);
      }
    } catch (err) {
      console.error("❌ Room initialization error:", err.message);
    }
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err.message);
    process.exit(1);
  });

// Port validation
const PORT = process.env.PORT || 5000;
if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
  console.error("❌ Invalid PORT:", PORT);
  process.exit(1);
}

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log("✅ API is ready!\n");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("✅ HTTP server closed");
    mongoose.connection.close(false, () => {
      console.log("✅ MongoDB connection closed");
      process.exit(0);
    });
  });
});