import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "./models/message.model.js"; // Adjust path if needed
import { to_Encrypt } from "./lib/aes.js"; // Adjust path if needed

dotenv.config({ path: "./src/.env" });

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI);

console.log("🔄 Updating old messages...");

// Find messages that were stored without encryption
const oldMessages = await Message.find({ text: { $ne: null } });

for (let msg of oldMessages) {
  if (typeof msg.text === "string" && msg.text.trim() !== "") { 
    if (!msg.text.startsWith("ENC_")) { // Avoid double encryption
      msg.text = to_Encrypt(msg.text);
      await msg.save();
      console.log(`✅ Encrypted message: ${msg._id}`);
    }
  } else {
    console.log(`⚠️ Skipped invalid message: ${msg._id}`);
  }
}

console.log("✅ Old messages encrypted successfully.");

// Close MongoDB connection
mongoose.connection.close();
