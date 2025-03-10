import { useState, useRef } from "react";
import { X, MoreVertical, Video, Phone } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import CallContainer from "./CallContainer"; // Import CallContainer component
import AudioContainer from "./AudioContainer";

const ChatHeader = ({ setIsDeleting }) => {
  const { authUser } = useAuthStore();
  const { selectedUser, setSelectedUser, clearChat } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false); // State to manage video call visibility
  const [isAudioCall, setIsAudioCall] = useState(false); // State to manage audio call visibility
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(); // ✅ Ensure peerConnectionRef is initialized
  peerConnectionRef.current = peerConnectionRef.current || null; // ✅ Prevent undefined errors
  const iceCandidateQueue = useRef([]);
  const socket = useAuthStore((state) => state.socket);

  const handleDeleteMessages = () => {
    setIsDeleting(true);
    setShowMenu(false);
  };

  const handleClearChat = async () => {
    await clearChat(selectedUser._id);
    setShowMenu(false);
  };

  const handleVideoCall = async () => {
    setIsVideoCall(true); // Show the CallContainer component for video call
  };

  const handleAudioCall = async () => {
    setIsAudioCall(true); // Show the CallContainer component for audio call
  };

  return (
    <div className="p-2.5 border-b border-base-300 relative">
      {/* Chat Header */}
      <div className="flex items-center justify-between">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
              />
            </div>
          </div>

          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Menu button */}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)}>
            <MoreVertical />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={handleDeleteMessages}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Delete Messages
              </button>
              <button
                onClick={handleClearChat}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Clear Chat
              </button>
            </div>
          )}
        </div>

        {/* Video Call Button */}
        <button onClick={handleVideoCall}>
          <Video />
        </button>

        {/* Audio Call Button */}
        <button onClick={handleAudioCall}>
          <Phone />
        </button>

        {/* Close Chat Button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>

      {/* Render CallContainer when Video Call is Active */}
      {isVideoCall && (
        <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center">
          <CallContainer
            selectedUser={selectedUser}
            onEndCall={() => setIsVideoCall(false)}
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
            peerConnectionRef={peerConnectionRef} // ✅ Pass peerConnectionRef correctly
            iceCandidateQueue={iceCandidateQueue}
            isAudioCall={false} // Indicate that this is a video call
          />
          <button
            onClick={() => setIsVideoCall(false)}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
          >
            End Call
          </button>
        </div>
      )}

      {/* Render CallContainer when Audio Call is Active */}
      {isAudioCall && (
        <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center">
          <AudioContainer
            selectedUser={selectedUser}
            onEndCall={() => setIsAudioCall(false)}
            localAudioRef={localAudioRef}
            remoteAudioRef={remoteAudioRef}
            peerConnectionRef={peerConnectionRef} // ✅ Pass peerConnectionRef correctly
            iceCandidateQueue={iceCandidateQueue}
            isAudioCall={true} // Indicate that this is an audio call
          />
          <button
            onClick={() => setIsAudioCall(false)}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
          >
            End Call
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;