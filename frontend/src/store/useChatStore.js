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
  unreadCounts: {}, // Track unread messages for each contact or group
  totalUnreadCount: 0, // Total unread messages count

  deleteMessages: async (messageIds) => {
    try {
      await axiosInstance.post("/messages/delete", { messageIds });
      set((state) => ({
        messages: state.messages.filter((message) => !messageIds.includes(message._id)),
      }));
      toast.success("Messages deleted successfully");
    } catch (error) {
      toast.error("Failed to delete messages");
    }
  },

  clearChat: async (userId) => {
    try {
      await axiosInstance.post(`/messages/clear/${userId}`);
      set({ messages: [] });
      toast.success("Chat cleared successfully");
    } catch (error) {
      toast.error("Failed to clear chat");
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
      // Reset unread count for the selected user or group
      set((state) => {
        const unreadCounts = { ...state.unreadCounts };
        delete unreadCounts[userId];
        return {
          unreadCounts,
          totalUnreadCount: Object.values(unreadCounts).reduce((a, b) => a + b, 0),
        };
      });
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
      // Reset unread count for the selected group
      set((state) => {
        const unreadCounts = { ...state.unreadCounts };
        delete unreadCounts[groupId];
        return {
          unreadCounts,
          totalUnreadCount: Object.values(unreadCounts).reduce((a, b) => a + b, 0),
        };
      });
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

  getNotificationCounts: async () => {
    try {
      const res = await axiosInstance.get("/messages/notifications/counts");
      set({ unreadCounts: res.data, totalUnreadCount: Object.values(res.data).reduce((a, b) => a + b, 0) });
    } catch (error) {
      toast.error("Failed to fetch notification counts");
    }
  },

  subscribeToMessages: (isGroup = false) => {
    const { selectedUser, selectedGroup } = get();
    const socket = useAuthStore.getState().socket;

    if (selectedUser && !isGroup) {
      socket.on("newMessage", (newMessage) => {
        if (newMessage.senderId === selectedUser._id) {
          set({ messages: [...get().messages, newMessage] });
        } else {
          // Increment unread count for the sender
          set((state) => {
            const unreadCounts = { ...state.unreadCounts };
            unreadCounts[newMessage.senderId] = (unreadCounts[newMessage.senderId] || 0) + 1;
            return {
              unreadCounts,
              totalUnreadCount: Object.values(unreadCounts).reduce((a, b) => a + b, 0),
            };
          });
        }
      });
    }

    if (selectedGroup && isGroup) {
      socket.on("newGroupMessage", (newMessage) => {
        if (newMessage.groupId === selectedGroup._id) {
          set({ messages: [...get().messages, newMessage] });
        } else {
          // Increment unread count for the group
          set((state) => {
            const unreadCounts = { ...state.unreadCounts };
            unreadCounts[newMessage.groupId] = (unreadCounts[newMessage.groupId] || 0) + 1;
            return {
              unreadCounts,
              totalUnreadCount: Object.values(unreadCounts).reduce((a, b) => a + b, 0),
            };
          });
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