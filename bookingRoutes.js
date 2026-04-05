const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const User = require("../models/User");

// GET all bookings or filter by roll number
router.get("/", async (req, res) => {
  try {
    const { rollNo } = req.query; 
    let filter = {};
    
    if (rollNo && rollNo !== "null" && rollNo !== "undefined") {
      // Input sanitization
      filter = { studentRollNo: rollNo.trim().toLowerCase() }; 
    }
    
    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Apply for room or complaint
router.post("/apply", async (req, res) => {
  try {
    const { studentRollNo, type, message } = req.body;
    
    // Validation
    if (!studentRollNo || !type || !message) {
      return res.status(400).json({ error: "Missing required fields: studentRollNo, type, message" });
    }

    if (!["Room Request", "Complaint"].includes(type)) {
      return res.status(400).json({ error: "Type must be 'Room Request' or 'Complaint'" });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    // Verify user exists
    const userExists = await User.findOne({ rollNo: studentRollNo.trim().toLowerCase() });
    if (!userExists) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Check for duplicate pending Room Request
    if (type === "Room Request") {
      const existingRequest = await Booking.findOne({
        studentRollNo: studentRollNo.trim().toLowerCase(),
        type: "Room Request",
        status: "Pending"
      });

      if (existingRequest) {
        return res.status(400).json({ error: "You already have a pending room request. Wait for admin response." });
      }
    }

    const newBooking = new Booking({ 
      studentRollNo: studentRollNo.trim().toLowerCase(), 
      type, 
      message: message.trim(), 
      status: "Pending" 
    });
    
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(400).json({ error: err.message });
  }
});

// PUT - Update booking status
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid booking ID format" });
    }

    // Validate status
    if (updateData.status && !["Pending", "Approved", "Rejected"].includes(updateData.status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Validate slot
    if (updateData.slot && !["M1", "M2"].includes(updateData.slot)) {
      return res.status(400).json({ error: "Invalid slot value" });
    }

    // Validate room number format if provided
    if (updateData.roomNumber && !/^\d{3}$/.test(updateData.roomNumber)) {
      return res.status(400).json({ error: "Invalid room number format (must be 3 digits like 101)" });
    }

    // Check if trying to reject while room is allocated
    if (updateData.status === "Rejected" && updateData.roomNumber) {
      console.warn(`Warning: Rejecting booking ${id} that has room ${updateData.roomNumber}`);
    }

    const updated = await Booking.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    
    if (!updated) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Delete booking (Admin only)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid booking ID format" });
    }

    const deleted = await Booking.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({ message: "Booking deleted successfully", deleted });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;