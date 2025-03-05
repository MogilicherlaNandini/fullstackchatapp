// import Group from "../models/group.model.js";
// import User from "../models/user.model.js";
// import cloudinary from "../lib/cloudinary.js"; // Import Cloudinary

// export const createGroup = async (req, res) => {
//   const { name, members, pic } = req.body;

//   try {
//     const creatorId = req.user._id;
//     const allMembers = Array.isArray(members) ? [...new Set([...members, creatorId])] : [creatorId];

//     // Upload profile picture only if provided
//     let profilePicUrl = null;
//     if (pic) {
//       try {
//         const uploadResponse = await cloudinary.uploader.upload(pic, {
//           folder: "group_pics",
//         });
//         profilePicUrl = uploadResponse.secure_url;
//       } catch (uploadError) {
//         console.error("Cloudinary upload failed:", uploadError.message);
//         return res.status(400).json({ message: "Image upload failed" });
//       }
//     }

//     const newGroup = new Group({
//       name,
//       pic: profilePicUrl,
//       members: allMembers,
//     });

//     await newGroup.save();
//     res.status(201).json(newGroup);
//   } catch (error) {
//     console.error("Error in createGroup controller:", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// export const getGroups = async (req, res) => {
//   try {
//     const groups = await Group.find({ members: req.user._id })
//       .populate("members", "fullName profilePic");
//     res.status(200).json(groups);
//   } catch (error) {
//     console.error("Error in getGroups controller:", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };
import Group from "../models/group.model.js";
import GroupMessage from "../models/groupMessage.model.js"; // Import GroupMessage model
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js"; // Import Cloudinary

export const createGroup = async (req, res) => {
  const { name, members, pic } = req.body;

  try {
    const creatorId = req.user._id;
    const allMembers = Array.isArray(members) ? [...new Set([...members, creatorId])] : [creatorId];

    // Upload profile picture only if provided
    let profilePicUrl = null;
    if (pic) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(pic, {
          folder: "group_pics",
        });
        profilePicUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError.message);
        return res.status(400).json({ message: "Image upload failed" });
      }
    }

    const newGroup = new Group({
      name,
      pic: profilePicUrl,
      members: allMembers,
      admins: [creatorId], // Set the creator as the initial admin
    });

    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Error in createGroup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate("members", "fullName profilePic");
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getGroups controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateGroupProfile = async (req, res) => {
  const { groupId } = req.params;
  const { name, pic } = req.body;
  const userId = req.user._id;

  try {
    const group = await Group.findById(groupId);
    if (!group.admins.includes(userId)) {
      return res.status(403).json({ message: "Only admins can update the group profile" });
    }

    let profilePicUrl = null;
    if (pic) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(pic, {
          folder: "group_pics",
        });
        profilePicUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError.message);
        return res.status(400).json({ message: "Image upload failed" });
      }
    }

    group.name = name || group.name;
    group.pic = profilePicUrl || group.pic;
    await group.save();

    res.status(200).json(group);
  } catch (error) {
    console.error("Error in updateGroupProfile controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateGroupMembers = async (req, res) => {
  const { groupId } = req.params;
  const { members } = req.body;
  const userId = req.user._id;

  try {
    const group = await Group.findById(groupId);
    if (!group.admins.includes(userId)) {
      return res.status(403).json({ message: "Only admins can update group members" });
    }

    group.members = members;
    await group.save();

    res.status(200).json(group);
  } catch (error) {
    console.error("Error in updateGroupMembers controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const makeAdmin = async (req, res) => {
  const { groupId, userId } = req.params;
  const adminId = req.user._id;

  try {
    const group = await Group.findById(groupId);
    if (!group.admins.includes(adminId)) {
      return res.status(403).json({ message: "Only admins can make other users admin" });
    }

    if (!group.members.includes(userId)) {
      return res.status(404).json({ message: "User is not a member of the group" });
    }

    group.admins.push(userId);
    await group.save();

    res.status(200).json(group);
  } catch (error) {
    console.error("Error in makeAdmin controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const removeUser = async (req, res) => {
  const { groupId, userId } = req.params;
  const adminId = req.user._id;

  try {
    const group = await Group.findById(groupId);
    if (!group.admins.includes(adminId)) {
      return res.status(403).json({ message: "Only admins can remove users" });
    }

    group.members = group.members.filter(member => member.toString() !== userId);
    group.admins = group.admins.filter(admin => admin.toString() !== userId);
    await group.save();

    res.status(200).json(group);
  } catch (error) {
    console.error("Error in removeUser controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteGroupChatForUser = async (req, res) => {
  const { groupId } = req.params;

  try {
    await GroupMessage.updateMany(
      { groupId },
      { $addToSet: { deletedFor: req.user._id } }
    );

    res.status(200).json({ message: "Chat deleted for user" });
  } catch (error) {
    console.error("Error in deleteGroupChatForUser controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const exitGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user._id;

  try {
    // Remove the user from the group members
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    group.members = group.members.filter(member => member.toString() !== userId.toString());
    await group.save();

    // Send a message indicating that the user has left the group
    const leaveMessage = new GroupMessage({
      groupId,
      senderId: userId,
      text: `${req.user.fullName} has left the group.`,
    });
    await leaveMessage.save();

    res.status(200).json({ message: "You have exited the group" });
  } catch (error) {
    console.error("Error in exitGroup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};