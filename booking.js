const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  
  studentRollNo: { 
    type: String, 
    required: true 
  },
  
  
  type: { 
    type: String, 
    enum: ["Room Request", "Complaint"], 
    required: true 
  },
  
  
  message: { 
    type: String,
    required: true
  },
  
  
  status: { 
    type: String, 
    enum: ["Pending", "Approved", "Rejected"], 
    default: "Pending" 
  },

  
  roomNumber: { 
    type: String, 
    default: null 
  },

  
  slot: { 
    type: String, 
    enum: ["M1", "M2", null], 
    default: null 
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Booking", bookingSchema);