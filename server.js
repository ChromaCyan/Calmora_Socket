const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();
const mongoose = require("mongoose");
const initializeSocket = require("./socket/socket");
const Notification = require("./model/notificationModel"); 
const geminiRoutes = require("./routes/geminiRoute");
const timeslotRoutes = require("./routes/timeslotRoute");

const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

const io = initializeSocket(server); 

app.use("/api/chatbot", geminiRoutes);
app.use("/api/timeslot", timeslotRoutes);

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.post("/emit-notification", async (req, res) => {
  console.log("📥 Received emit-notification request:", req.body);
  try {
    const { userId, type, message, extra = {} } = req.body;

    if (!userId || !type || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Save notification to DB
    const notification = new Notification({
      userId,
      type,
      message,
      extra,
    });
    await notification.save();

    // Emit real-time notification
    io.to(userId).emit("new_notification", {
      type,
      message,
      timestamp: new Date(),
      ...extra,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in /emit-notification:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});
