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

  try {
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

    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { name, pic: profilePicUrl },
      { new: true }
    ).populate("members", "fullName profilePic");

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in updateGroupProfile controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateGroupMembers = async (req, res) => {
  const { groupId } = req.params;
  const { members } = req.body;

  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { members },
      { new: true }
    ).populate("members", "fullName profilePic");

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in updateGroupMembers controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteGroupChatForUser = async (req, res) => {
  const { groupId, userId } = req.params;

  try {
    await GroupMessage.updateMany(
      { groupId },
      { $addToSet: { deletedFor: userId } }
    );

    res.status(200).json({ message: "Chat deleted for user" });
  } catch (error) {
    console.error("Error in deleteGroupChatForUser controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
