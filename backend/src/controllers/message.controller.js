// import User from "../models/user.model.js";
// import Message from "../models/message.model.js";

// import cloudinary from "../lib/cloudinary.js";
// import { getReceiverSocketId, io } from "../lib/socket.js";

// export const getUsersForSidebar = async (req, res) => {
//   try {
//     const loggedInUserId = req.user._id;
//     const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

//     res.status(200).json(filteredUsers);
//   } catch (error) {
//     console.error("Error in getUsersForSidebar: ", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export const getMessages = async (req, res) => {
//   try {
//     const { id: userToChatId } = req.params;
//     const myId = req.user._id;

//     const messages = await Message.find({
//       $or: [
//         { senderId: myId, receiverId: userToChatId },
//         { senderId: userToChatId, receiverId: myId },
//       ],
//     });

//     res.status(200).json(messages);
//   } catch (error) {
//     console.log("Error in getMessages controller: ", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export const sendMessage = async (req, res) => {
//   try {
//     const { text, image } = req.body;
//     const { id: receiverId } = req.params;
//     const senderId = req.user._id;

//     let imageUrl;
//     if (image) {
//       // Upload base64 image to cloudinary
//       const uploadResponse = await cloudinary.uploader.upload(image);
//       imageUrl = uploadResponse.secure_url;
//     }

//     const newMessage = new Message({
//       senderId,
//       receiverId,
//       text,
//       image: imageUrl,
//     });

//     await newMessage.save();

//     const receiverSocketId = getReceiverSocketId(receiverId);
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("newMessage", newMessage);
//     }

//     res.status(201).json(newMessage);
//   } catch (error) {
//     console.log("Error in sendMessage controller: ", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { to_Encrypt, to_Decrypt, encryptFile, decryptFile } from "../lib/aes.js";

// ✅ Get all users for the sidebar
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("❌ Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Get messages (decrypting text & files before sending)
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      deletedBy: { $ne: myId },
    });

    const decryptedMessages = messages.map((message) => {
      const decryptedText = message.text ? to_Decrypt(message.text) : null;
      const decryptedFile = message.file ? decryptFile(message.file) : null;

      return {
        ...message.toObject(),
        text: decryptedText,
        file: decryptedFile ? decryptedFile.toString("base64") : null,
      };
    });

    // Reset unread count for the selected user or group
    await User.findByIdAndUpdate(myId, {
      $set: { [`notificationCounts.${userToChatId}`]: 0 },
    });

    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.error("❌ Error in getMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Send a new message (encrypting text & files before saving)
export const sendMessage = async (req, res) => {
  try {
    const { text, file, fileName } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let encryptedFile = null;
    if (file) {
      const fileBuffer = Buffer.from(file, "base64");
      encryptedFile = encryptFile(fileBuffer);
    }

    // 🔒 Encrypt the text message before storing
    const encryptedText = text ? to_Encrypt(text) : null;
    console.log("🔒 Encrypted Text Before Saving:", encryptedText); // Debugging

    const newMessage = new Message({
      senderId,
      receiverId,
      text: encryptedText, // Store encrypted text
      file: encryptedFile, // Store encrypted file
      fileName,
    });

    await newMessage.save();
    console.log("new message", newMessage);

    // Increment notification count for the receiver
    await User.findByIdAndUpdate(receiverId, {
      $inc: { [`notificationCounts.${senderId}`]: 1 },
    });

    // 🔄 Emit real-time message event
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        senderId,
        receiverId,
        text, // Send decrypted text to frontend
        file,
        fileName,
      });
    }

    res.status(201).json({
      ...newMessage.toObject(),
      text, // Send decrypted text to frontend
      file,
    });
  } catch (error) {
    console.error("❌ Error in sendMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
// ✅ Get notification counts
export const getNotificationCounts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("notificationCounts");
    res.status(200).json(user.notificationCounts);
  } catch (error) {
    console.error("❌ Error in getNotificationCounts:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessages = async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user._id;
    await Message.updateMany(
      { _id: { $in: messageIds } },
      { $addToSet: { deletedBy: userId } }
    );
    res.status(200).json({ message: "Messages deleted successfully" });
  } catch (error) {
    console.error("❌ Error in deleteMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const clearChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;
    await Message.updateMany(
      {
        $or: [
          { senderId: myId, receiverId: userId },
          { senderId: userId, receiverId: myId },
        ],
      },
      { $addToSet: { deletedBy: myId } }
    );
    res.status(200).json({ message: "Chat cleared successfully" });
  } catch (error) {
    console.error("❌ Error in clearChat:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};