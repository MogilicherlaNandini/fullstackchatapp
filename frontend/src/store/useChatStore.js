// import { create } from "zustand";
// import toast from "react-hot-toast";
// import { axiosInstance } from "../lib/axios";
// import { useAuthStore } from "./useAuthStore";

// export const useChatStore = create((set, get) => ({
//   messages: [],
//   users: [],
//   selectedUser: null,
//   isUsersLoading: false,
//   isMessagesLoading: false,

//   getUsers: async () => {
//     set({ isUsersLoading: true });
//     try {
//       const res = await axiosInstance.get("/messages/users");
//       set({ users: res.data });
//     } catch (error) {
//       toast.error(error.response.data.message);
//     } finally {
//       set({ isUsersLoading: false });
//     }
//   },

//   getMessages: async (userId) => {
//     set({ isMessagesLoading: true });
//     try {
//       const res = await axiosInstance.get(`/messages/${userId}`);
//       set({ messages: res.data });
//     } catch (error) {
//       toast.error(error.response.data.message);
//     } finally {
//       set({ isMessagesLoading: false });
//     }
//   },
//   sendMessage: async (messageData) => {
//     const { selectedUser, messages } = get();
//     try {
//       const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
//       set({ messages: [...messages, res.data] });
//     } catch (error) {
//       toast.error(error.response.data.message);
//     }
//   },

//   subscribeToMessages: () => {
//     const { selectedUser } = get();
//     if (!selectedUser) return;

//     const socket = useAuthStore.getState().socket;

//     socket.on("newMessage", (newMessage) => {
//       const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
//       if (!isMessageSentFromSelectedUser) return;

//       set({
//         messages: [...get().messages, newMessage],
//       });
//     });
//   },

//   unsubscribeFromMessages: () => {
//     const socket = useAuthStore.getState().socket;
//     socket.off("newMessage");
//   },

//   setSelectedUser: (selectedUser) => set({ selectedUser }),
// }));

import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  groups: [],
  selectedUser: null,
  selectedGroup: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  deleteGroupChatForUser: async (groupId, userId) => {
    try {
      await axiosInstance.delete(`/groups/${groupId}/messages/${userId}`);
    } catch (error) {
      console.error("Error deleting group chat for user:", error);
      throw error;
    }
  },

  updateGroupMembers: async (groupId, members) => {
    try {
      const res = await axiosInstance.put(`/groups/${groupId}/members`, { members });
      if (res.data) {
        set((state) => ({
          groups: state.groups.map(group =>
            group._id === groupId ? res.data : group
          ),
          selectedGroup: res.data,
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating group members");
    }
  },
  updateGroupProfile: async (groupId, groupData) => {
    try {
      const res = await axiosInstance.put(`/groups/${groupId}`, groupData);
      if (res.data) {
        set((state) => ({
          groups: state.groups.map(group =>
            group._id === groupId ? res.data : group
          ),
          selectedGroup: res.data, // Update the selected group immediately
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating group profile");
    }
  },


  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getGroups: async () => {
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  getMessages: async (userId, isGroup = false) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/${isGroup ? 'groups' : 'messages'}/${userId}/messages`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/groups", groupData);
      if (res.data) {
        set((state) => ({ groups: [...state.groups, res.data] }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating group");
    }
  },

  getGroupMessages: async (groupId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendGroupMessage: async (groupId, messageData) => {
    const { messages } = get();
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/messages`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: (isGroup = false) => {
    const { selectedUser, selectedGroup } = get();
    const socket = useAuthStore.getState().socket;

    if (selectedUser && !isGroup) {
      socket.on("newMessage", (newMessage) => {
        if (newMessage.senderId === selectedUser._id) {
          set({ messages: [...get().messages, newMessage] });
        }
      });
    }

    if (selectedGroup && isGroup) {
      socket.on("newGroupMessage", (newMessage) => {
        if (newMessage.groupId === selectedGroup._id) {
          set({ messages: [...get().messages, newMessage] });
        }
      });
    }
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("newGroupMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser, selectedGroup: null }),
  setSelectedGroup: (selectedGroup) => set({ selectedGroup, selectedUser: null }),
}));