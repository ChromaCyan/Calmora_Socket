const { Server } = require("socket.io");
const Chat = require("../model/chatModel");
const { createNotification } = require("../controller/notificationController");

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("sendMessage", async (data) => {
      console.log("Message received: ", data);
      const { senderId, recipientId, message, chatId } = data;

      try {
        // Find or create chat
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
        };

        chat.messages.push(newMessage);
        await chat.save();

        // Emit to recipient room
        io.to(recipientId).emit("receiveMessage", {
          chatId,
          senderId: newMessage.sender,
          content: newMessage.content,
          timestamp: newMessage.timestamp,
          status: "sent",
          senderFirstName: sender.firstName,
          senderLastName: sender.lastName,
        });

        // Notification logic
        await createNotification(
          recipientId,
          "chat",
          `New message from ${sender.firstName} ${sender.lastName}`
        );

        io.to(recipientId).emit("new_notification", {
          type: "chat",
          senderId,
          senderFirstName: sender.firstName,
          senderLastName: sender.lastName,
          chatId,
          message: newMessage.content,
          timestamp: newMessage.timestamp,
        });
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = initializeSocket;
