import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from "../store/useChatStore";
import MessageInput from './MessageInput';
import MessageSkeleton from './skeletons/MessageSkeleton';
import { useAuthStore } from '../store/useAuthStore';
import { formatMessageTime } from '../lib/utils';
import GroupChatHeader from './GroupChatHeader';

const GroupChatContainer = () => {
  const {
    messages,
    getGroupMessages,
    isMessagesLoading,
    selectedGroup,
    subscribeToMessages,
    unsubscribeFromMessages,
    sendGroupMessage
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedGroup) {
      getGroupMessages(selectedGroup._id);
      subscribeToMessages(true);
    }

    return () => unsubscribeFromMessages();
  }, [selectedGroup, getGroupMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (messageData) => {
    if (messageData.text.trim() || messageData.file) {
      await sendGroupMessage(selectedGroup._id, messageData);
    }
  };

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

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <GroupChatHeader />
        <MessageSkeleton />
        <MessageInput isGroupChat={true} groupId={selectedGroup._id} onSendMessage={handleSendMessage} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <GroupChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id} // Ensure each message has a unique key
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderProfilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <span className="font-bold">{message.senderName}</span>
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {/* Image File */}
              {message.file && /\.(jpeg|jpg|png|gif)$/i.test(message.fileName) && (
                <img
                  src={`data:image/jpeg;base64,${message.file}`}
                  alt={message.fileName || "Image"}
                  className="mb-2 rounded-lg max-w-xs"
                />
              )}

              {/* Other File Types (Download) */}
              {message.file && !/\.(jpeg|jpg|png|gif)$/i.test(message.fileName) && (
                <div className="mb-2 rounded-lg">
                  <button
                    onClick={() => handleDownload(`data:application/octet-stream;base64,${message.file}`, message.fileName)}
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
      <MessageInput isGroupChat={true} groupId={selectedGroup._id} onSendMessage={handleSendMessage} />
    </div>
  );
};

export default GroupChatContainer;