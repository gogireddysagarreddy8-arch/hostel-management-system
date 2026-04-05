const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomNumber: String,
  capacity: Number,
  available: { type: Boolean, default: true }
});

module.exports = mongoose.model("Room", roomSchema);
