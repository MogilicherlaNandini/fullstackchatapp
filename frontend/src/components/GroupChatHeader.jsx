// import React from 'react';
// import { X } from "lucide-react";
// import { useChatStore } from "../store/useChatStore";

// const GroupChatHeader = () => {
//   const { selectedGroup, setSelectedGroup } = useChatStore();

//   if (!selectedGroup) return null;

//   return (
//     <div className="p-2.5 border-b border-base-300">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           {/* Group Avatar */}
//           <div className="avatar">
//             <div className="size-10 rounded-full relative">
//               <img src={selectedGroup.pic || "/avatar.png"} alt={selectedGroup.name} />
//             </div>
//           </div>

//           {/* Group info */}
//           <div>
//             <h3 className="font-medium">{selectedGroup.name}</h3>
//             <p className="text-sm text-base-content/70">
//               {selectedGroup.members.map((member) => member.fullName).join(', ')}
//             </p>
//           </div>
//         </div>

//         {/* Close button */}
//         <button onClick={() => setSelectedGroup(null)}>
//           <X />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default GroupChatHeader;
import React, { useState } from 'react';
import { X, MoreVertical } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios"; // Import axiosInstance
import UpdateProfileModal from "./UpdateProfileModal"; // Import UpdateProfileModal
import AddMembersModal from "./AddMembersModal"; // Import AddMembersModal

const GroupChatHeader = () => {
  const { selectedGroup, setSelectedGroup, getGroups, getGroupMessages, sendGroupMessage, deleteGroupChatForUser } = useChatStore();
  const { authUser } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [showMakeAdminModal, setShowMakeAdminModal] = useState(false);
  const [showRemoveUserModal, setShowRemoveUserModal] = useState(false);

  if (!selectedGroup) return null;

  const isAdmin = selectedGroup.admins.includes(authUser._id);

  const handleExitGroup = async () => {
    try {
      // Call the backend to exit the group
      await axiosInstance.post(`/groups/${selectedGroup._id}/exit`);

      toast.success("You have exited the group.");
      setSelectedGroup(null);
      getGroups();
    } catch (error) {
      console.error("Error exiting group:", error);
      toast.error("Failed to exit group.");
    }
  };

  const handleDeleteChat = async () => {
    try {
      // Delete the chat for the particular user
      await deleteGroupChatForUser(selectedGroup._id);
      toast.success("Chat deleted.");
      setSelectedGroup(null);
      getGroupMessages(selectedGroup._id);
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat.");
    }
  };

  const handleMakeAdmin = async (userId) => {
    try {
      await axiosInstance.post(`/groups/${selectedGroup._id}/make-admin/${userId}`);
      toast.success("User has been made an admin.");
      setShowMakeAdminModal(false);
      getGroups();
    } catch (error) {
      console.error("Error making user admin:", error);
      toast.error("Failed to make user admin.");
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      await axiosInstance.post(`/groups/${selectedGroup._id}/remove-user/${userId}`);
      toast.success("User has been removed from the group.");
      setShowRemoveUserModal(false);
      getGroups();
    } catch (error) {
      console.error("Error removing user:", error);
      toast.error("Failed to remove user.");
    }
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Group Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedGroup.pic || "/avatar.png"} alt={selectedGroup.name} />
            </div>
          </div>

          {/* Group info */}
          <div>
            <h3 className="font-medium">{selectedGroup.name}</h3>
            <p className="text-sm text-base-content/70">
              {selectedGroup.members.map((member) => member.fullName).join(', ')}
            </p>
          </div>
        </div>

        {/* Menu button */}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)}>
            <MoreVertical />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
              {isAdmin && (
                <>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowUpdateProfileModal(true);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Update Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowAddMembersModal(true);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Add New Members
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowMakeAdminModal(true);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Make Admin
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowRemoveUserModal(true);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Remove User
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleExitGroup();
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Exit Group
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleDeleteChat();
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Delete Chat
              </button>
            </div>
          )}
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedGroup(null)}>
          <X />
        </button>
      </div>

      {/* Update Profile Modal */}
      {showUpdateProfileModal && (
        <UpdateProfileModal
          group={selectedGroup}
          onClose={() => setShowUpdateProfileModal(false)}
        />
      )}

      {/* Add Members Modal */}
      {showAddMembersModal && (
        <AddMembersModal
          group={selectedGroup}
          onClose={() => setShowAddMembersModal(false)}
        />
      )}

      {/* Make Admin Modal */}
      {showMakeAdminModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-medium mb-4">Make Admin</h3>
            <ul>
              {selectedGroup.members
                .filter((member) => !selectedGroup.admins.includes(member._id))
                .map((member) => (
                  <li key={member._id} className="flex justify-between items-center mb-2">
                    <span>{member.fullName}</span>
                    <button
                      onClick={() => handleMakeAdmin(member._id)}
                      className="text-blue-500 underline"
                    >
                      Make Admin
                    </button>
                  </li>
                ))}
            </ul>
            <button
              onClick={() => setShowMakeAdminModal(false)}
              className="mt-4 w-full text-center text-sm text-gray-700 hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Remove User Modal */}
      {showRemoveUserModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-medium mb-4">Remove User</h3>
            <ul>
              {selectedGroup.members
                .filter((member) => member._id !== authUser._id)
                .map((member) => (
                  <li key={member._id} className="flex justify-between items-center mb-2">
                    <span>{member.fullName}</span>
                    <button
                      onClick={() => handleRemoveUser(member._id)}
                      className="text-red-500 underline"
                    >
                      Remove
                    </button>
                  </li>
                ))}
            </ul>
            <button
              onClick={() => setShowRemoveUserModal(false)}
              className="mt-4 w-full text-center text-sm text-gray-700 hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChatHeader;