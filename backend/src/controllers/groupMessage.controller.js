import GroupMessage from "../models/groupMessage.model.js";
import Group from "../models/group.model.js";
import User from "../models/user.model.js"; // Import User model
import { getReceiverSocketId, io } from "../lib/socket.js";
import { to_Encrypt, to_Decrypt, encryptFile, decryptFile } from "../lib/aes.js";

// Get group messages
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const messages = await GroupMessage.find({
      groupId,
      deletedFor: { $ne: userId }
    });

    const decryptedMessages = await Promise.all(messages.map(async (message) => {
      const sender = await User.findById(message.senderId).select('fullName profilePic');
      return {
        ...message.toObject(),
        text: message.text ? to_Decrypt(message.text) : null,
        file: message.file ? decryptFile(message.file).toString("base64") : null,
        senderName: sender.fullName,
        senderProfilePic: sender.profilePic,
      };
    }));

    // Reset unread count for the selected group
    await User.findByIdAndUpdate(userId, {
      $set: { [`notificationCounts.${groupId}`]: 0 },
    });

    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.error("Error in getGroupMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send a new group message
export const sendGroupMessage = async (req, res) => {
  try {
    const { text, file, fileName } = req.body;
    const { groupId } = req.params;
    const senderId = req.user._id;

    const encryptedText = text ? to_Encrypt(text) : null;
    const encryptedFile = file ? encryptFile(Buffer.from(file, "base64")) : null;

    const newMessage = new GroupMessage({ senderId, groupId, text: encryptedText, file: encryptedFile, fileName });
    await newMessage.save();

    // Fetch sender details
    const sender = await User.findById(senderId).select("fullName profilePic");

    const group = await Group.findById(groupId).populate("members");
    group.members.forEach((user) => {
      const receiverSocketId = getReceiverSocketId(user._id);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newGroupMessage", {
          _id: newMessage._id,
          senderId,
          senderName: sender.fullName,
          senderProfilePic: sender.profilePic,
          groupId,
          text,
          file,
          fileName,
          createdAt: newMessage.createdAt,
        });

        // Increment unread count for the group members
        if (user._id.toString() !== senderId) {
          User.findByIdAndUpdate(user._id, {
            $inc: { [`notificationCounts.${groupId}`]: 1 },
          }).exec();
        }
      }
    });

    res.status(201).json({
      _id: newMessage._id,
      senderId,
      senderName: sender.fullName,
      senderProfilePic: sender.profilePic,
      groupId,
      text,
      file,
      fileName,
      createdAt: newMessage.createdAt,
    });

  } catch (error) {
    console.error("Error in sendGroupMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};