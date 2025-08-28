const Notification = require("../model/notificationModel");

// Create a new notification
exports.createNotification = async (userId, type, message) => {
    try {
      console.log(`Creating notification for User: ${userId}, Type: ${type}`);
  
      const notification = new Notification({ userId, type, message });
      await notification.save();
  
      console.log("Notification saved successfully:", notification);
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };
  
// Get all notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve notifications." });
  }
};

// Mark notifications as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    res.status(200).json({ message: "Notification marked as read." });
  } catch (error) {
    res.status(500).json({ error: "Failed to update notification." });
  }
};

// Mark all notifications as read for a specific user
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    res.status(200).json({ message: "All notifications marked as read." });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark all notifications as read." });
  }
};
