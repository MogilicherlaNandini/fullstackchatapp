import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import groupRoutes from './routes/group.route.js';
import { app, server } from "./lib/socket.js";


dotenv.config({ path: "./src/.env" });
const PORT = process.env.PORT;
const __dirname = path.resolve();

// Middleware setup
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies to be sent
  allowedHeaders: 'Content-Type,Authorization'
}));
app.options('*', cors()); // Enable pre-flight for all routes
app.use(express.json({ limit: "500mb" })); // Increase JSON payload limit
app.use(express.urlencoded({ limit: "500mb", extended: true }));
app.use(cookieParser());

// Route setup
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use('/api/groups', groupRoutes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Start the server
server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});