import { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import CallContainer from "./components/CallContainer";

import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useChatStore } from "./store/useChatStore";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, connectSocket, disconnectSocket, socket } = useAuthStore();
  const { theme } = useThemeStore();
  const { subscribeToMessages, setReceivingCall, setIncomingCallData, setCallAccepted, isReceivingCall, incomingCallData, callAccepted } = useChatStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const iceCandidateQueue = useRef([]);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Connect socket and subscribe to messages when user logs in
  useEffect(() => {
    if (authUser) {
      connectSocket();
      subscribeToMessages();

      return () => {
        disconnectSocket();
      };
    }
  }, [authUser, connectSocket, disconnectSocket, subscribeToMessages]);

  // Listen for incoming video calls
  useEffect(() => {
    if (!socket) return;

    socket.on("incoming-call", ({ senderId, offer, callerName }) => {
      setReceivingCall(true);
      setIncomingCallData({ senderId, offer, callerName });
    });

    socket.on("call-rejected", () => {
      setReceivingCall(false);
      setIncomingCallData(null);
    });

    socket.on("call-ended", () => {
      setReceivingCall(false);
      setIncomingCallData(null);
      setCallAccepted(false);
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-rejected");
      socket.off("call-ended");
    };
  }, [socket, setReceivingCall, setIncomingCallData, setCallAccepted]);

  // Show loading while checking authentication
  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  const handleAcceptCall = () => {
    setCallAccepted(true);
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

      {/* Always render CallContainer */}
      {(isReceivingCall || callAccepted) && (
        <CallContainer
          selectedUser={incomingCallData?.senderId}
          onEndCall={() => setCallAccepted(false)}
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          peerConnectionRef={peerConnectionRef}
          iceCandidateQueue={iceCandidateQueue}
        />
      )}

      <Toaster />
    </div>
  );
};

export default App;