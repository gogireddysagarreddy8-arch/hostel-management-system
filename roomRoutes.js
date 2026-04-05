const express = require("express");
const router = express.Router();
const Room = require("../models/Room");


router.get("/status", async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch room data" });
  }
});


router.post("/initialize", async (req, res) => {
  try {
    const floors = [1, 2, 3];
    const roomCount = 5;
    let createdRooms = [];

    for (let f of floors) {
      for (let r = 1; r <= roomCount; r++) {
        const roomNo = `${f}0${r}`;
        const exists = await Room.findOne({ roomNumber: roomNo });
        if (!exists) {
          const newRoom = new Room({ roomNumber: roomNo, available: true, capacity: 2 });
          await newRoom.save();
          createdRooms.push(roomNo);
        }
      }
    }
    res.status(201).json({ message: "Rooms initialized", rooms: createdRooms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 