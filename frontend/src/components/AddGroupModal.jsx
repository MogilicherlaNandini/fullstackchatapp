import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const AddGroupModal = ({ onClose }) => {
  const { users, createGroup } = useChatStore();
  const [groupName, setGroupName] = useState("");
  const [groupPic, setGroupPic] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleAddGroup = async () => {
    const groupData = {
      name: groupName,
      pic: groupPic,
      members: selectedUsers,
    };
    await createGroup(groupData);
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setGroupPic(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-5 rounded-lg shadow-lg">
        <h2 className="text-lg font-medium mb-4">Create Group</h2>
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
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Select Users</h3>
          <div className="max-h-40 overflow-y-auto">
            {users.map((user) => (
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
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={handleAddGroup} className="btn btn-primary">Create</button>
        </div>
      </div>
    </div>
  );
};

export default AddGroupModal;