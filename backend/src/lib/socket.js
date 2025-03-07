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

  /** Handle Call Events */
  socket.on("offer", ({ offer, senderId, receiverId }) => {
    console.log(`Offer from ${senderId} to ${receiverId}`);
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("offer", { offer, senderId });
    }
  });

  socket.on("answer", ({ answer, senderId, receiverId }) => {
    console.log(`Answer from ${senderId} to ${receiverId}`);
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("answer", { answer, senderId });
    }
  });

  socket.on("candidate", ({ candidate, senderId, receiverId }) => {
    console.log(`ICE Candidate from ${senderId} to ${receiverId}`);
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("candidate", { candidate, senderId });
    }
  });

  socket.on("call-ended", ({ senderId, receiverId }) => {
    console.log(`Call ended by ${senderId}`);
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call-ended");
    }
  });

  /** Handle User Disconnection */
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
