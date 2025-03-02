import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const AddMembersModal = ({ group, onClose }) => {
  const { users, updateGroupMembers } = useChatStore();
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Filter out users who are already in the group
  const availableUsers = users.filter(user => !group.members.some(member => member._id === user._id));

  const handleAddMembers = async () => {
    try {
      const updatedMembers = [...group.members.map(member => member._id), ...selectedUsers];
      await updateGroupMembers(group._id, updatedMembers);
      toast.success("Members added to the group.");
      onClose();
    } catch (error) {
      console.error("Error adding members:", error);
      toast.error("Failed to add members.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-5 rounded-lg shadow-lg">
        <h2 className="text-lg font-medium mb-4">Add New Members</h2>
        <div className="max-h-40 overflow-y-auto mb-4">
          {availableUsers.map((user) => (
            <div key={user._id} className="flex items-center mb-2">
              <input
                type="checkbox"
                value={user._id}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedUsers([...selectedUsers, user._id]);
                  } else {
                    setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                  }
                }}
                className="checkbox checkbox-sm"
              />
              <span className="ml-2">{user.fullName}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={handleAddMembers} className="btn btn-primary">Add</button>
        </div>
      </div>
    </div>
  );
};

export default AddMembersModal;