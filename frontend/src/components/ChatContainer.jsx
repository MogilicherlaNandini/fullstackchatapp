// import { useChatStore } from "../store/useChatStore";
// import { useEffect, useRef } from "react";

// import ChatHeader from "./ChatHeader";
// import MessageInput from "./MessageInput";
// import MessageSkeleton from "./skeletons/MessageSkeleton";
// import { useAuthStore } from "../store/useAuthStore";
// import { formatMessageTime } from "../lib/utils";

// const ChatContainer = () => {
//   const {
//     messages,
//     getMessages,
//     isMessagesLoading,
//     selectedUser,
//     subscribeToMessages,
//     unsubscribeFromMessages,
//   } = useChatStore();
//   const { authUser } = useAuthStore();
//   const messageEndRef = useRef(null);

//   useEffect(() => {
//     getMessages(selectedUser._id);

//     subscribeToMessages();

//     return () => unsubscribeFromMessages();
//   }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

//   useEffect(() => {
//     if (messageEndRef.current && messages) {
//       messageEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   if (isMessagesLoading) {
//     return (
//       <div className="flex-1 flex flex-col overflow-auto">
//         <ChatHeader />
//         <MessageSkeleton />
//         <MessageInput />
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 flex flex-col overflow-auto">
//       <ChatHeader />

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((message) => (
//           <div
//             key={message._id}
//             className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
//             ref={messageEndRef}
//           >
//             <div className=" chat-image avatar">
//               <div className="size-10 rounded-full border">
//                 <img
//                   src={
//                     message.senderId === authUser._id
//                       ? authUser.profilePic || "/avatar.png"
//                       : selectedUser.profilePic || "/avatar.png"
//                   }
//                   alt="profile pic"
//                 />
//               </div>
//             </div>
//             <div className="chat-header mb-1">
//               <time className="text-xs opacity-50 ml-1">
//                 {formatMessageTime(message.createdAt)}
//               </time>
//             </div>
//             <div className="chat-bubble flex flex-col">
//               {message.image && (
//                 <img
//                   src={message.image}
//                   alt="Attachment"
//                   className="sm:max-w-[200px] rounded-md mb-2"
//                 />
//               )}
//               {message.text && <p>{message.text}</p>}
//             </div>
//           </div>
//         ))}
//       </div>

//       <MessageInput />
//     </div>
//   );
// };
// export default ChatContainer;
//................................................
// import { useChatStore } from "../store/useChatStore";
// import { useEffect, useRef } from "react";
// import ChatHeader from "./ChatHeader";
// import MessageInput from "./MessageInput";
// import MessageSkeleton from "./skeletons/MessageSkeleton";
// import { useAuthStore } from "../store/useAuthStore";
// import { formatMessageTime } from "../lib/utils";

// const ChatContainer = () => {
//   const {
//     messages,
//     getMessages,
//     isMessagesLoading,
//     selectedUser,
//     subscribeToMessages,
//     unsubscribeFromMessages,
//   } = useChatStore();

//   const { authUser } = useAuthStore();
//   const messageEndRef = useRef(null);

//   // Fetch messages on user selection change
//   useEffect(() => {
//     if (selectedUser?._id) {
//       getMessages(selectedUser._id);
//       subscribeToMessages();
//     }

//     return () => unsubscribeFromMessages();
//   }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

//   // Auto-scroll when new messages arrive
//   useEffect(() => {
//     if (messageEndRef.current) {
//       messageEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   // Handle file download
//   const handleDownload = async (fileUrl, fileName) => {
//     try {
//       const response = await fetch(fileUrl);
//       if (!response.ok) throw new Error("Failed to fetch file");

//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = fileName || "download";
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error("Error downloading file:", error);
//       alert("Failed to download file. Please try again.");
//     }
//   };

//   if (isMessagesLoading) {
//     return (
//       <div className="flex-1 flex flex-col overflow-auto">
//         <ChatHeader />
//         <MessageSkeleton />
//         <MessageInput />
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 flex flex-col overflow-auto">
//       <ChatHeader />
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((message) => (
//           <div
//             key={message._id}
//             className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
//             ref={messageEndRef}
//           >
//             <div className="chat-image avatar">
//               <div className="size-10 rounded-full border">
//                 <img
//                   src={
//                     message.senderId === authUser._id
//                       ? authUser.profilePic || "/avatar.png"
//                       : selectedUser.profilePic || "/avatar.png"
//                   }
//                   alt="profile pic"
//                 />
//               </div>
//             </div>
//             <div className="chat-header mb-1">
//               <time className="text-xs opacity-50 ml-1">
//                 {formatMessageTime(message.createdAt)}
//               </time>
//             </div>
//             <div className="chat-bubble flex flex-col">
//   {/* Image File */}
//   {message.file && /\.(jpeg|jpg|png|gif)$/i.test(message.file) && (
//     <img
//       src={message.file}
//       alt={message.fileName || "Image"}
//       className="mb-2 rounded-lg max-w-xs"
//     />
//   )}

//   {/* Other File Types (Download) */}
//   {message.file && !/\.(jpeg|jpg|png|gif)$/i.test(message.file) && (
//     <div className="mb-2 rounded-lg">
//       <button
//         onClick={() => handleDownload(message.file, message.fileName)}
//         className="text-blue-500 underline"
//       >
//         {message.fileName || "Download File"}
//       </button>
//     </div>
//   )}

//   {/* Text Message */}
//   {message.text && <p>{message.text}</p>}
// </div>

//           </div>
//         ))}
//       </div>

//       <MessageInput />
//     </div>
//   );
// };

// // ✅ Ensure default export is present
// export default ChatContainer;
// //.......................................................
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    sendMessage,
    deleteMessages,
    clearChat,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);

  // Fetch messages when the selected user changes
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle file download
  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  const handleSelectMessage = (messageId) => {
    setSelectedMessages((prev) =>
      prev.includes(messageId) ? prev.filter((id) => id !== messageId) : [...prev, messageId]
    );
  };

  const handleDeleteSelectedMessages = async () => {
    await deleteMessages(selectedMessages);
    setSelectedMessages([]);
    setIsDeleting(false);
  };

  const handleSendMessage = async (messageData) => {
    if (messageData.text.trim() || messageData.file) {
      await sendMessage(selectedUser._id, messageData);
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader setIsDeleting={setIsDeleting} />
        <MessageSkeleton />
        {selectedUser && <MessageInput onSendMessage={handleSendMessage} />}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader setIsDeleting={setIsDeleting} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            {isDeleting && (
              <input
                type="checkbox"
                checked={selectedMessages.includes(message._id)}
                onChange={() => handleSelectMessage(message._id)}
                className="mr-2"
              />
            )}
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {/* Image File */}
              {message.file && message.mimeType?.startsWith("image/") && (
                <img
                  src={`data:${message.mimeType};base64,${message.file}`}
                  alt={message.fileName || "Image"}
                  className="mb-2 rounded-lg max-w-xs"
                />
              )}

              {/* Video File */}
              {message.file && message.mimeType?.startsWith("video/") && (
                <video
                  src={`data:${message.mimeType};base64,${message.file}`}
                  controls
                  className="mb-2 rounded-lg max-w-xs"
                />
              )}

              {/* Audio File */}
              {message.file && message.mimeType?.startsWith("audio/") && (
                <audio
                  src={`data:${message.mimeType};base64,${message.file}`}
                  controls
                  className="mb-2 rounded-lg max-w-xs"
                />
              )}

              {/* Other File Types (Download) */}
              {message.file &&
                !message.mimeType?.startsWith("image/") &&
                !message.mimeType?.startsWith("video/") &&
                !message.mimeType?.startsWith("audio/") && (
                  <div className="mb-2 rounded-lg">
                    <button
                      onClick={() => handleDownload(`data:${message.mimeType};base64,${message.file}`, message.fileName)}
                      className="text-blue-500 underline"
                    >
                      {message.fileName || "Download File"}
                    </button>
                  </div>
                )}

              {/* Text Message */}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      {isDeleting && (
        <div className="p-4 flex justify-end">
          <button onClick={handleDeleteSelectedMessages} className="btn btn-danger">
            Delete Selected
          </button>
          <button onClick={() => setIsDeleting(false)} className="btn btn-secondary ml-2">
            Cancel
          </button>
        </div>
      )}

      {selectedUser && <MessageInput onSendMessage={handleSendMessage} />}
    </div>
  );
};

export default ChatContainer;
