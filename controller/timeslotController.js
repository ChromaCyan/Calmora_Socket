const TimeSlot = require("../model/timeslotModel");
const { createNotification } = require("./notificationController");
const Appointment = require("../model/appointmentModel");
const User = require("../model/userModel");
const axios = require("axios");
const { io } = require("../socket/socket");
const Availability = require("../model/availabilityModel");

exports.getAvailableSlots = async (req, res) => {
  try {
    const { specialistId, date } = req.params;

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const slots = await TimeSlot.find({
      specialist: specialistId,
      dayOfWeek: { $regex: new RegExp(dayOfWeek, "i") },
    });

    const appointmentsOnDate = await Appointment.find({
      specialist: specialistId,
      timeSlot: { $in: slots.map((s) => s._id) },
      appointmentDate: {
        $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(selectedDate.setHours(23, 59, 59, 999)),
      },
      status: { $nin: ["completed", "declined"] },
    });

    const bookedSlotIds = appointmentsOnDate.map((a) => a.timeSlot.toString());

    const availableSlots = slots.filter(
      (slot) => !bookedSlotIds.includes(slot._id.toString())
    );

    console.log(`Specialist ID: ${specialistId}, Date: ${date}`);
    console.log(`Day of Week: ${dayOfWeek}`);
    console.log(`Total Slots Found: ${slots.length}`);
    console.log(`Booked Slots on ${date}: ${bookedSlotIds.length}`);
    console.log(`Available Slots: ${availableSlots.length}`);

    res.status(200).json({ success: true, slots: availableSlots });
  } catch (error) {
    console.error("Error fetching available slots:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all time slots for a specialist (regardless of date)
exports.getAllSlots = async (req, res) => {
  try {
    const { specialistId } = req.params;

    const slots = await TimeSlot.find({ specialist: specialistId });

    if (!slots.length) {
      return res
        .status(404)
        .json({ success: false, message: "No time slots found" });
    }

    console.log(`Specialist ID: ${specialistId}`);
    console.log(`Found Slots: ${slots.length}`);
    console.log(`Slots:`, slots);

    res.status(200).json({ success: true, slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a time slot for that specialist.
exports.addTimeSlot = async (req, res) => {
  try {
    const { specialistId, dayOfWeek, startTime, endTime } = req.body;

    const parseTimeToMinutes = (timeStr) => {
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (modifier.toLowerCase() === "pm" && hours !== 12) hours += 12;
      if (modifier.toLowerCase() === "am" && hours === 12) hours = 0;
      return hours * 60 + (minutes || 0);
    };

    const start = parseTimeToMinutes(startTime);
    const end = parseTimeToMinutes(endTime);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End time must be later than start time.",
      });
    }

    const existingSlots = await TimeSlot.find({
      specialist: specialistId,
      dayOfWeek,
    });

    const isOverlap = existingSlots.some((slot) => {
      const s = parseTimeToMinutes(slot.startTime);
      const e = parseTimeToMinutes(slot.endTime);
      return start < e && end > s; 
    });

    if (isOverlap) {
      return res.status(400).json({
        success: false,
        message: "Time slot overlaps with existing slot.",
      });
    }

    const newSlot = await TimeSlot.create({
      specialist: specialistId,
      dayOfWeek,
      startTime,
      endTime,
    });

    res.status(201).json({ success: true, data: newSlot });
  } catch (error) {
    console.error("Error adding time slot:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a time slot for a specialist
exports.updateTimeSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { startTime, endTime, dayOfWeek } = req.body;

    const slot = await TimeSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Time slot not found",
      });
    }

    const parseTimeToMinutes = (timeStr) => {
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (modifier.toLowerCase() === "pm" && hours !== 12) hours += 12;
      if (modifier.toLowerCase() === "am" && hours === 12) hours = 0;
      return hours * 60 + (minutes || 0);
    };

    const newStartTime = startTime || slot.startTime;
    const newEndTime = endTime || slot.endTime;
    const newDay = dayOfWeek || slot.dayOfWeek;

    const start = parseTimeToMinutes(newStartTime);
    const end = parseTimeToMinutes(newEndTime);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End time must be later than start time.",
      });
    }

    const existingSlots = await TimeSlot.find({
      specialist: slot.specialist,
      dayOfWeek: newDay,
      _id: { $ne: slotId }, 
    });

    const isOverlap = existingSlots.some((s) => {
      const sStart = parseTimeToMinutes(s.startTime);
      const sEnd = parseTimeToMinutes(s.endTime);
      return start < sEnd && end > sStart;
    });

    if (isOverlap) {
      return res.status(400).json({
        success: false,
        message: "Updated time slot overlaps with an existing slot.",
      });
    }

    // Update slot safely
    slot.startTime = newStartTime;
    slot.endTime = newEndTime;
    slot.dayOfWeek = newDay;
    await slot.save();

    res.status(200).json({ success: true, data: slot });
  } catch (error) {
    console.error("Error updating slot:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Book an appointment
exports.bookTimeSlot = async (req, res) => {
  try {
    console.log("Booking Request Body:", req.body);

    const { patientId, slotId, message, appointmentDate } = req.body;

    const slot = await TimeSlot.findById(slotId).populate("specialist");

    if (!slot) {
      console.log("Slot not found!");
      return res
        .status(404)
        .json({ success: false, message: "Time slot not found" });
    }

    const existingSpecialistAppointment = await Appointment.findOne({
      patient: patientId,
      specialist: slot.specialist._id,
      status: { $nin: ["completed", "declined"] },
    });

    if (existingSpecialistAppointment) {
      console.log("Already booked with this specialist!");
      return res.status(400).json({
        success: false,
        message:
          "You already have an ongoing/pending appointment with this specialist. Finish it before booking another.",
      });
    }

    const conflictingAppointment = await Appointment.findOne({
      patient: patientId,
      appointmentDate: {
        $gte: new Date(new Date(appointmentDate).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(appointmentDate).setHours(23, 59, 59, 999)),
      },
      status: { $nin: ["completed", "declined"] },
    });

    if (conflictingAppointment) {
      console.log("Conflicting appointment found for the same date!");
      return res.status(400).json({
        success: false,
        message:
          "You already have an appointment booked for this date or time slot with another specialist.",
      });
    }

    const existingAppointment = await Appointment.findOne({
      timeSlot: slot._id,
      appointmentDate: new Date(appointmentDate),
      status: { $nin: ["completed", "declined"] },
    });

    if (existingAppointment) {
      console.log("Slot already booked for this date!");
      return res.status(400).json({
        success: false,
        message: "Time slot is already booked for this date",
      });
    }

    const patient = await User.findById(patientId);
    if (!patient || patient.userType !== "Patient") {
      console.log("Patient not found or invalid user type!");
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    const newAppointment = await Appointment.create({
      patient: patientId,
      specialist: slot.specialist._id,
      timeSlot: slot._id,
      message,
      appointmentDate: new Date(appointmentDate),
    });

    // Send notification to specialist
    await axios.post(`${process.env.SOCKET_SERVER_URL}/emit-notification`, {
      userId: slot.specialist._id.toString(),
      type: "appointment",
      message: "You have a new appointment request.",
      extra: { appointmentId: newAppointment._id, patientId },
    });

    console.log("Appointment created successfully:", newAppointment);

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Booking error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Appointment (specialist)
exports.deleteTimeSlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    const slot = await TimeSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Time slot not found",
      });
    }

    const existingAppointments = await Appointment.find({
      timeSlot: slotId,
      appointmentDate: { $gte: new Date() },
      status: { $nin: ["completed", "declined"] },
    });

    if (existingAppointments.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a slot with upcoming appointments",
      });
    }

    await TimeSlot.findByIdAndDelete(slotId);

    res.status(200).json({
      success: true,
      message: "Time slot deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting slot:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
