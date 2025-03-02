import React, { useState } from 'react';
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const UpdateProfileModal = ({ group, onClose }) => {
  const { updateGroupProfile } = useChatStore();
  const [groupName, setGroupName] = useState(group.name);
  const [groupPic, setGroupPic] = useState(group.pic);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setGroupPic(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async () => {
    try {
      const updatedGroup = {
        name: groupName,
        pic: groupPic,
      };
      await updateGroupProfile(group._id, updatedGroup);
      toast.success("Group profile updated.");
      onClose();
    } catch (error) {
      console.error("Error updating group profile:", error);
      toast.error("Failed to update group profile.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-5 rounded-lg shadow-lg">
        <h2 className="text-lg font-medium mb-4">Update Group Profile</h2>
        <input
          type="text"
          placeholder="Enter group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="input input-bordered w-full mb-4"
        />
        <input
          type="file"
          onChange={handleFileChange}
          className="input input-bordered w-full mb-4"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={handleUpdateProfile} className="btn btn-primary">Update</button>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfileModal;