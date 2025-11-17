
# Calmora Socket Server – Real-Time Backend Documentation

![Calmora Logo](images/calmora_circle_crop.png)

---

A real-time backend server powering **Calmora**, handling chat messaging, live notifications, and socket-based events for patients and specialists.

Built using **Node.js**, **Express**, **Socket.IO**, and **MongoDB**.

---

## 📌 Table of Contents
1. Overview
2. Tech Stack
3. Project Structure
4. Installation & Setup
5. Environment Variables
6. Socket Events
7. REST Endpoints
8. Running the Server

---

## 🎯 Overview

The Calmora Socket Server handles:

- Real-time chat messaging  
- Message delivery tracking  
- Real-time notifications  
- Room management (join/leave chat rooms)  
- Intelligent notification logic  
- Interaction with MongoDB chat + user models  

This runs **separately** from the main Calmora API.

---

## 🛠 Tech Stack

| Layer | Technology |
|------|------------|
| Backend Framework | **Node.js + Express** |
| Database | **MongoDB / Mongoose / Supabase**  |
| Real-time | **Socket.IO** |
| AI Integration | **Google Gemini API** |
| Auth | **JWT** |
| Deployment | Vercel, Render, or Own server |

---

## 📁 Project Structure

```
/model
/controller
/routes
/socket
server.js
.env
```

---

## 🔧 Installation & Setup

### 1. Clone repo
```sh
git clone https://github.com/ChromaCyan/Calmora_Socket.git
cd calmora-socket
```

### 2. Install dependencies
```sh
npm install
```

### 3. Create `.env`
```
PORT=5000
MONGO_URI=your_mongo_url
```

---

## ⚡ Server Entry Point — `server.js`

- Creates Express server  
- Creates HTTP server wrapper  
- Initializes Socket.IO  
- Registers REST routes  
- Connects to MongoDB  
- Exposes `/emit-notification` for API → Socket communication  
- Starts socket server  

Start using:

```sh
node server.js
```

---

## 🔌 Socket.IO Logic — `/socket/socket.js`

### Key features:
✔ User registration for personal notification rooms  
✔ Join/leave chat rooms  
✔ Save messages to MongoDB  
✔ Emit real-time messages  
✔ Intelligent notifications (only sent when recipient is outside the chat room)  
✔ Manage message delivery status  

---

## 🧠 Socket Events

### 🔹 `registerUser`
Register a user to receive personal notifications.

```js
socket.emit("registerUser", userId)
```

---

### 🔹 `joinRoom`
Join a specific chat room.

```js
socket.emit("joinRoom", roomId)
```

---

### 🔹 `leaveRoom`
Leave a chat room.

```js
socket.emit("leaveRoom", roomId)
```

---

### 🔹 `sendMessage`
Send a new chat message.

```js
socket.emit("sendMessage", {
  senderId,
  recipientId,
  message,
  chatId
})
```

Server behavior:
- Saves message  
- Fetches sender user info  
- Emits live message to recipient  
- Sends notification *only if recipient is NOT in active chat room*  

---

### 🔹 `receiveMessage` (client listener)

Recipient listens for new messages:

```js
socket.on("receiveMessage", (data) => {
  console.log("New Message:", data)
})
```

---

### 🔹 `new_notification` (client listener)

```js
socket.on("new_notification", (data) => {
  console.log("Notification:", data)
})
```

---

## 📨 REST Endpoints

### **POST `/emit-notification`**

Used by the API server to trigger socket notifications.

**Payload:**
```json
{
  "userId": "123",
  "type": "chat",
  "message": "New message",
  "extra": {}
}
```

---

## ▶ Running the Socket Server

### Development:
```sh
node server.js
```

### With nodemon:
```sh
nodemon server.js
```

---

## ✔ Summary

This socket service enables:
- Real-time messaging  
- Notification system  
- Scalable multi-room chat  
- Seamless API integration  

The module is flexible, secure, and optimized for production.

---
