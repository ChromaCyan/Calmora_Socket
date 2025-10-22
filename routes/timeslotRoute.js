const express = require("express");
const router = express.Router();
const timeSlotController = require("../controller/timeslotController");
const { verifyToken, isPatient, isSpecialist } = require("../middleware/authMiddleware");

// Get all slots for a specialist
router.get("/:specialistId/all", timeSlotController.getAllSlots);
// Get all available time slot for that specialist
router.get("/:specialistId/:date", verifyToken, timeSlotController.getAvailableSlots);
// Create a time slot (specialist)
router.post("/", verifyToken, timeSlotController.addTimeSlot);
// Update the time slot (specialist)
router.put("/:slotId", verifyToken, timeSlotController.updateTimeSlot);
// Delete the time slot (specialist)
router.delete("/:slotId", verifyToken, timeSlotController.deleteTimeSlot);
// Book a time slot
router.post("/book", verifyToken, timeSlotController.bookTimeSlot);

module.exports = router;
