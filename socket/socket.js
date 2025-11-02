const { Server } = require("socket.io");
const Chat = require("../model/chatModel");
const User = require("../model/userModel");
const { createNotification } = require("../controller/notificationController");

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // 🧠 Track users and their active chat rooms
  const userActiveRooms = new Map(); // { userId: roomId }

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Register user for personal notifications
    socket.on("registerUser", (userId) => {
      socket.join(userId);
      socket.userId = userId; // store reference
      console.log(`User ${userId} registered for notifications`);
    });

    // Join a chat room
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      userActiveRooms.set(socket.userId, roomId);
      console.log(`User ${socket.userId} joined room ${roomId}`);
    });

    // Leave a chat room
    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      if (userActiveRooms.get(socket.userId) === roomId) {
        userActiveRooms.delete(socket.userId);
      }
      console.log(`User ${socket.userId} left room ${roomId}`);
    });

    // Handle sending messages
    // socket.on("sendMessage", async (data) => {
    //   console.log("Message received:", data);
    //   const { senderId, recipientId, message, chatId } = data;

    //   try {
    //     // Find or create chat
    //     let chat = await Chat.findById(chatId);
    //     if (!chat) {
    //       chat = new Chat({
    //         _id: chatId,
    //         participants: [senderId, recipientId],
    //         messages: [],
    //       });
    //     }

    //     const newMessage = {
    //       sender: senderId,
    //       content: message,
    //       timestamp: new Date(),
    //     };

    //     chat.messages.push(newMessage);
    //     await chat.save();

    //     // Fetch sender info
    //     const sender = await User.findById(senderId);
    //     if (!sender) return console.error("Sender not found");

    //     // Emit to recipient room (live chat)
    //     io.to(recipientId).emit("receiveMessage", {
    //       chatId,
    //       senderId: newMessage.sender,
    //       content: newMessage.content,
    //       timestamp: newMessage.timestamp,
    //       status: "sent",
    //       senderFirstName: sender.firstName,
    //       senderLastName: sender.lastName,
    //       senderProfileImage: sender.profileImage,
    //     });

    //     // 🧠 Only create notification if recipient NOT in same chat room
    //     const recipientActiveRoom = userActiveRooms.get(recipientId);
    //     if (recipientActiveRoom !== chatId) {
    //       await createNotification(
    //         recipientId,
    //         "chat",
    //         `New message from ${sender.firstName} ${sender.lastName}`,
    //         {
    //           chatId,
    //           senderId: sender._id,
    //           senderFirstName: sender.firstName,
    //           senderLastName: sender.lastName,
    //           senderProfileImage: sender.profileImage,
    //         }
    //       );

    //       io.to(recipientId).emit("new_notification", {
    //         type: "chat",
    //         senderId,
    //         senderFirstName: sender.firstName,
    //         senderLastName: sender.lastName,
    //         senderProfileImage: sender.profileImage,
    //         chatId,
    //         message: newMessage.content,
    //         timestamp: newMessage.timestamp,
    //       });
    //       console.log(
    //         `📩 Notification created for ${recipientId} (not in chat ${chatId})`
    //       );
    //     } else {
    //       console.log(
    //         `💬 Skipped notification — recipient ${recipientId} is already in chat ${chatId}`
    //       );
    //     }
    //   } catch (error) {
    //     console.error("Error saving message:", error);
    //   }
    // });

    // Handle sending messages
    socket.on("sendMessage", async (data) => {
      const { senderId, recipientId, message, chatId } = data;

      try {
        let chat = await Chat.findById(chatId);
        if (!chat) {
          chat = new Chat({
            _id: chatId,
            participants: [senderId, recipientId],
            messages: [],
          });
        }

        const newMessage = {
          sender: senderId,
          content: message,
          timestamp: new Date(),
          status: "sent",
        };

        chat.messages.push(newMessage);
        await chat.save();

        const sender = await User.findById(senderId);
        if (!sender) return console.error("Sender not found");

        const recipientActiveRoom = userActiveRooms.get(recipientId);

        // If recipient is in the same room → mark as read immediately
        const status = recipientActiveRoom === chatId ? "read" : "sent";

        io.to(recipientId).emit("receiveMessage", {
          _id: newMessage._id,
          chatId,
          senderId: newMessage.sender,
          content: newMessage.content,
          timestamp: newMessage.timestamp,
          status,
          senderFirstName: sender.firstName,
          senderLastName: sender.lastName,
          senderProfileImage: sender.profileImage,
        });

        // 🧠 Only create notification if recipient NOT in same chat room
        if (recipientActiveRoom !== chatId) {
          await createNotification(
            recipientId,
            "chat",
            `New message from ${sender.firstName} ${sender.lastName}`,
            {
              chatId,
              senderId: sender._id,
              senderFirstName: sender.firstName,
              senderLastName: sender.lastName,
              senderProfileImage: sender.profileImage,
            }
          );

          io.to(recipientId).emit("new_notification", {
            type: "chat",
            senderId,
            senderFirstName: sender.firstName,
            senderLastName: sender.lastName,
            senderProfileImage: sender.profileImage,
            chatId,
            message: newMessage.content,
            timestamp: newMessage.timestamp,
          });
        }

        // Notify sender that message is delivered/read depending on recipient state
        io.to(senderId).emit("messageStatusUpdated", {
          chatId,
          messageId: newMessage._id,
          status,
        });
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    // ✅ Simplified: handle explicit manual read (optional)
    socket.on("messageRead", async (data) => {
      const { chatId, messageId, readerId, senderId } = data;

      try {
        const chat = await Chat.findById(chatId);
        if (!chat) return;

        const message = chat.messages.id(messageId);
        if (message && message.sender.toString() !== readerId) {
          message.status = "read";
          await chat.save();

          // Notify the original sender immediately
          io.to(senderId).emit("messageStatusUpdated", {
            chatId,
            messageId,
            status: "read",
          });

          // Optionally, notify everyone in the room (for sync)
          io.to(chatId).emit("messageStatusUpdated", {
            chatId,
            messageId,
            status: "read",
          });

          console.log(`✅ Message ${messageId} marked as READ by ${readerId}`);
        }
      } catch (err) {
        console.error("Error updating message to read:", err);
      }
    });

    // Wait for recipient acknowledgment
    socket.on("messageDelivered", async (data) => {
      const { chatId, messageId } = data;
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) return;
        const message = chat.messages.id(messageId);
        if (message) {
          message.status = "delivered";
          await chat.save();
          io.to(message.sender.toString()).emit("messageStatusUpdated", {
            chatId,
            messageId,
            status: "delivered",
          });
        }
      } catch (err) {
        console.error("Error updating message status:", err);
      }
    });

    // Mark message as read
    // socket.on("messageRead", async (data) => {
    //   const { chatId, messageId, readerId } = data;
    //   try {
    //     const chat = await Chat.findById(chatId);
    //     if (!chat) return;
    //     const message = chat.messages.id(messageId);
    //     if (message && message.sender.toString() !== readerId) {
    //       message.status = "read";
    //       await chat.save();

    //       // Notify sender
    //       io.to(message.sender.toString()).emit("messageStatusUpdated", {
    //         chatId,
    //         messageId,
    //         status: "read",
    //       });
    //     }
    //   } catch (err) {
    //     console.error("Error updating message to read:", err);
    //   }
    // });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      if (socket.userId) {
        userActiveRooms.delete(socket.userId);
      }
    });
  });

  return io;
}

module.exports = initializeSocket;
