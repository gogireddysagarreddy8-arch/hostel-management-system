const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Validation helper
const validateRollNo = (rollNo) => {
  return rollNo && rollNo.match(/^[a-z0-9]+$/i) && rollNo.length >= 8;
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

// GET - Check hostel capacity
router.get("/hostel/capacity", async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const maxCapacity = 30;
    const remainingCapacity = maxCapacity - totalStudents;
    
    res.json({
      totalStudents: totalStudents,
      maxCapacity: maxCapacity,
      remainingCapacity: remainingCapacity,
      isFull: totalStudents >= maxCapacity
    });
  } catch (err) {
    console.error("Capacity Check Error:", err);
    res.status(500).json({ message: "Server error checking capacity." });
  }
});

// POST - Student Register
router.post("/register", async (req, res) => {
  try {
    const { rollNo, password } = req.body;

    // Input validation
    if (!rollNo || !password) {
      return res.status(400).json({ message: "Roll number and password are required." });
    }

    if (!validateRollNo(rollNo)) {
      return res.status(400).json({ message: "Invalid roll number format (min 8 chars, alphanumeric)." });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    // Check hostel capacity BEFORE checking if user exists
    const totalStudents = await User.countDocuments({ role: "student" });
    const maxCapacity = 30;
    
    if (totalStudents >= maxCapacity) {
      return res.status(403).json({ 
        message: "🚫 Hostel is Full! No Vacancies Available.",
        isFull: true,
        totalStudents: totalStudents,
        maxCapacity: maxCapacity
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ rollNo: rollNo.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Roll Number already registered." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      rollNo: rollNo.trim().toLowerCase(),
      password: hashedPassword,
      role: "student" 
    });

    await newUser.save();
    
    // Get updated capacity
    const updatedTotal = await User.countDocuments({ role: "student" });
    
    res.status(201).json({ 
      message: "Student registered successfully!",
      registeredStudents: updatedTotal,
      remainingCapacity: maxCapacity - updatedTotal
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// POST - Student Login
router.post("/student-login", async (req, res) => {
  try {
    const { rollNo, password } = req.body;

    // Input validation
    if (!rollNo || !password) {
      return res.status(401).json({ message: "Roll number and password are required." });
    }

    // Find student
    const student = await User.findOne({ 
      rollNo: rollNo.trim().toLowerCase(), 
      role: "student" 
    });

    if (!student) {
      return res.status(401).json({ message: "Invalid student credentials." });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid student credentials." });
    }

    // Success
    res.json({
      message: "Login successful!",
      rollNo: student.rollNo,
      id: student._id,
      role: "student"
    });
  } catch (err) {
    console.error("Student Login Error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
});

// POST - Admin Login
router.post("/admin-login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
      return res.status(401).json({ message: "Username and password are required." });
    }

    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin@123";

    // Validate credentials
    if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      res.json({
        message: "Admin login successful!",
        username: username,
        role: "admin"
      });
    } else {
      return res.status(401).json({ message: "Invalid admin credentials." });
    }
  } catch (err) {
    console.error("Admin Login Error:", err);
    res.status(500).json({ message: "Server error during admin login." });
  }
});

module.exports = router;