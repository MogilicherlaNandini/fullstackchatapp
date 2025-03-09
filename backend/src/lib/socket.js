import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

// Store online users (userId -> socketId)
const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  /** 📌 STEP 1: Notify Receiver About Incoming Call */
  socket.on("start-call", ({ senderId, receiverId }) => {
    console.log(`📞 Call initiated from ${senderId} to ${receiverId}`);

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incoming-call", { senderId });
    } else {
      io.to(socket.id).emit("call-failed", { message: "User is offline" });
    }
  });

  /** 📌 STEP 2: Send WebRTC Offer After Accepting Call */
  socket.on("offer", ({ offer, senderId, receiverId }) => {
    console.log(`📡 Sending offer from ${senderId} to ${receiverId}`);
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("offer", { offer, senderId });
    }
  });

  /** 📌 STEP 3: Send Answer to the Caller */
  socket.on("answer", ({ answer, senderId, receiverId }) => {
    console.log(`✅ Answer from ${senderId} to ${receiverId}`);
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("answer", { answer, senderId });
    }
  });

  /** 📌 STEP 4: Handle ICE Candidates */
  socket.on("candidate", ({ candidate, senderId, receiverId }) => {
    console.log(`❄️ ICE Candidate from ${senderId} to ${receiverId}`);
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("candidate", { candidate, senderId });
    }
  });

  /** 📌 STEP 5: Handle Call End */
  socket.on("call-ended", ({ senderId, receiverId }) => {
    console.log(`⛔ Call ended by ${senderId}`);
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call-ended");
    }
  });

  /** 📌 STEP 6: Handle Call Rejection */
  socket.on("call-rejected", ({ senderId, receiverId }) => {
    console.log(`🚫 Call rejected by ${receiverId}`);
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("call-rejected");
    }
  });

  /** 📌 STEP 7: Handle User Disconnection */
  socket.on("disconnect", () => {
    console.log("❌ A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };