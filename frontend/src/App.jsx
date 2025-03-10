import { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import CallContainer from "./components/CallContainer";
import AudioContainer from "./components/AudioContainer";

import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useChatStore } from "./store/useChatStore";

import { Loader } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, connectSocket, disconnectSocket, socket } = useAuthStore();
  const { theme } = useThemeStore();
  const {
    subscribeToMessages, setReceivingCall, setIncomingCallData, setCallAccepted,
    isReceivingCall, incomingCallData, callAccepted,
    setAudioReceivingCall, setIncomingAudioCallData, setAudioCallAccepted,
    isAudioReceivingCall, incomingAudioCallData, audioCallAccepted ,setSelectedUser
  } = useChatStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const iceCandidateQueue = useRef([]);
  const [isAudioCall, setIsAudioCall] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Manage socket connection on authentication
  useEffect(() => {
    if (authUser) {
      connectSocket();
      subscribeToMessages();
    } else {
      disconnectSocket();
    }
  }, [authUser, connectSocket, disconnectSocket, subscribeToMessages]);

  // Handle incoming calls
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = ({ senderId, offer, callerName, isAudio }) => {
      console.log("Incoming call:", { senderId, offer, callerName, isAudio });
      setReceivingCall(true);
      setIncomingCallData({ senderId, offer, callerName, isAudio });
      setIsAudioCall(isAudio);
    };

    const handleCallRejected = () => {
      console.log("Call rejected");
      setReceivingCall(false);
      setIncomingCallData(null);
      toast.error("Call was rejected.");
    };

    const handleCallEnded = () => {
      console.log("Call ended");
      setReceivingCall(false);
      setIncomingCallData(null);
      setCallAccepted(false);
    };

    const handleIncomingAudioCall = ({ senderId, offer, callerName }) => {
      setSelectedUser(senderId);
      
     console.log("Incoming audio call:", { senderId, offer, callerName });
      setAudioReceivingCall(true);
      setIncomingAudioCallData({ senderId, offer, callerName });
      setIsAudioCall(true);  // Ensure audio call is detected
    };
    

    const handleAudioCallRejected = () => {
      console.log("Audio call rejected");
      setAudioReceivingCall(false);
      setIncomingAudioCallData(null);
      toast.error("Audio call was rejected.");
    };

    const handleAudioCallEnded = () => {
      console.log("Audio call ended");
      setAudioReceivingCall(false);
      setIncomingAudioCallData(null);
      setAudioCallAccepted(false);
    };

    // Attach event listeners
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-rejected", handleCallRejected);
    socket.on("call-ended", handleCallEnded);
    socket.on("audio-offer", handleIncomingAudioCall);
    socket.on("audio-call-rejected", handleAudioCallRejected);
    socket.on("audio-call-ended", handleAudioCallEnded);

    // Cleanup on unmount
    return () => {
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-rejected", handleCallRejected);
      socket.off("call-ended", handleCallEnded);
      socket.off("audio-offer", handleIncomingAudioCall);
      socket.off("audio-call-rejected", handleAudioCallRejected);
      socket.off("audio-call-ended", handleAudioCallEnded);
    };
  }, [socket, setReceivingCall, setIncomingCallData, setCallAccepted, setAudioReceivingCall, setIncomingAudioCallData, setAudioCallAccepted]);

  // Show loading while checking authentication
  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  const handleAcceptCall = () => {
    if (isAudioCall) {
      setAudioCallAccepted(true);
    } else {
      setCallAccepted(true);
    }
  };

  return (
    <div data-theme={theme} className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/settings" element={authUser ? <SettingsPage /> : <Navigate to="/login" />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* Call UI Rendering */}
      {(isReceivingCall || callAccepted || isAudioReceivingCall || audioCallAccepted) && (
        isAudioCall ? (
          <AudioContainer
            selectedUser={incomingAudioCallData?.senderId}
            onEndCall={() => setAudioCallAccepted(false)}
            localAudioRef={localAudioRef}
            remoteAudioRef={remoteAudioRef}
            peerConnectionRef={peerConnectionRef}
            iceCandidateQueue={iceCandidateQueue}
          />
        ) : (
          <CallContainer
            selectedUser={incomingCallData?.senderId}
            onEndCall={() => setCallAccepted(false)}
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
            peerConnectionRef={peerConnectionRef}
            iceCandidateQueue={iceCandidateQueue}
          />
        )
      )}

      <Toaster />
    </div>
  );
};

export default App;