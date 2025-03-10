import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const AudioContainer = ({ selectedUser, onEndCall, localAudioRef, remoteAudioRef, peerConnectionRef, iceCandidateQueue }) => {
  const { authUser } = useAuthStore();
  const { isAudioReceivingCall, setAudioReceivingCall, incomingAudioCallData, setIncomingAudioCallData, audioCallAccepted, setAudioCallAccepted } = useChatStore();
  const socket = useAuthStore((state) => state.socket);

  const [remoteStream, setRemoteStream] = useState(null); // State to store the remote stream
  useEffect(() => {
    if (!authUser) {
      console.error("authUser is undefined in AudioContainer!");
    }
  }, [authUser]);
  useEffect(() => {
    if (!socket) return;

    socket.on("audio-offer", handleReceiveCall);
    socket.on("audio-answer", handleAnswer);
    socket.on("audio-candidate", handleCandidate);
    socket.on("audio-call-ended", handleCallEnded);
    socket.on("audio-call-accepted", handleCallAccepted);

    return () => {
      socket.off("audio-offer", handleReceiveCall);
      socket.off("audio-answer", handleAnswer);
      socket.off("audio-candidate", handleCandidate);
      socket.off("audio-call-ended", handleCallEnded);
      socket.off("audio-call-accepted", handleCallAccepted);
    };
  }, [socket]);

  useEffect(() => {
    if (selectedUser && authUser) {
      startCall();
    }
  }, [selectedUser, authUser]);

  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleCallEnded = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    [localAudioRef, remoteAudioRef].forEach(ref => {
      if (ref.current?.srcObject) {
        ref.current.srcObject.getTracks().forEach(track => track.stop());
        ref.current.srcObject = null;
      }
    });

    setAudioCallAccepted(false);
    setAudioReceivingCall(false);
    setIncomingAudioCallData(null);
    onEndCall();
  };

  const handleCallAccepted = async ({ answer }) => {
    if (!peerConnectionRef.current) return;
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    setAudioCallAccepted(true);
  };

  const handleCandidate = async ({ candidate }) => {
    if (!peerConnectionRef.current) return;
    if (!peerConnectionRef.current.remoteDescription) {
      iceCandidateQueue.current.push(candidate);
      return;
    }
    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const handleAnswer = async ({ answer }) => {
    console.log("Received answer:", answer);
    if (!peerConnectionRef.current) {
      console.error("peerConnectionRef is not initialized");
      return;
    }
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    setAudioCallAccepted(true);
  };

  const handleReceiveCall = async ({ offer, senderId, callerName }) => {
    console.log("Received offer:", offer);
    setAudioReceivingCall(true);
    setIncomingAudioCallData({ offer, senderId, callerName });
    peerConnectionRef.current = createPeerConnection();
    peerConnectionRef.current.offerData = offer;
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && incomingAudioCallData) {
        socket.emit("audio-candidate", { candidate: event.candidate, senderId: authUser._id, receiverId: incomingAudioCallData.senderId });
      }
    };

    pc.ontrack = (event) => {
      console.log("Receiving remote track:", event.streams[0]);
      setRemoteStream(event.streams[0]);
    };

    return pc;
  };

  const startCall = async () => {
    if (!selectedUser || !selectedUser._id) {
      console.error("❌ Cannot start call. selectedUser or selectedUser._id is missing.");
      return;
    }
  
    if (!peerConnectionRef.current) {
      peerConnectionRef.current = createPeerConnection();
    }
  
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
      if (localAudioRef.current) localAudioRef.current.srcObject = stream;
      stream.getTracks().forEach(track => peerConnectionRef.current.addTrack(track, stream));
  
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
  
      console.log(`📡 Sending audio offer from ${authUser._id} to ${selectedUser._id}`);
      
      socket.emit("audio-offer", { 
        offer, 
        senderId: authUser._id, 
        receiverId: selectedUser._id, 
        callerName: authUser.fullName,
        isAudio: true // Indicate that this is an audio call
      });
    } catch (error) {
      console.error("❌ Error starting call:", error);
    }
  };
  
  const acceptCall = async () => {
    console.log("Accepting call");
    if (!peerConnectionRef.current) {
      peerConnectionRef.current = createPeerConnection();
    }

    try {
      setAudioReceivingCall(false);
      setAudioCallAccepted(true);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (localAudioRef.current) localAudioRef.current.srcObject = stream;
      stream.getTracks().forEach(track => peerConnectionRef.current.addTrack(track, stream));

      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(incomingAudioCallData.offer));

      while (iceCandidateQueue.current.length) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(iceCandidateQueue.current.shift()));
      }

      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      console.log("Sending answer:", answer);
      socket.emit("audio-answer", { 
        answer, 
        senderId: authUser._id, 
        receiverId: incomingAudioCallData.senderId 
      });

      setIncomingAudioCallData(null);
    } catch (error) {
      console.error("Error accepting call:", error);
    }
  };

  const handleRejectCall = () => {
    if (!incomingAudioCallData) return; // Prevent rejecting call if incomingAudioCallData is null
    console.log("Rejecting call from:", incomingAudioCallData.callerName);
    socket.emit("audio-call-rejected", { senderId: incomingAudioCallData.senderId, receiverId: authUser._id });
    setIncomingAudioCallData(null);
    setAudioReceivingCall(false);
  };

  return (
    <div className="call-container">
      <audio ref={localAudioRef} autoPlay playsInline muted />
      <audio ref={remoteAudioRef} autoPlay playsInline />
      {audioCallAccepted && (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="flex items-center gap-4">
            <div className="relative">
              <h1>{authUser.fullName}</h1>
              <img
                src={authUser?.profilePic || "/avatar.png"}
                alt={authUser?.fullName}
                className="w-24 h-24 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-ping w-24 h-24 rounded-full bg-blue-500 opacity-75"></div>
              </div>
            </div>
            <div className="relative">
            <h1>{selectedUser?.fullName}</h1>
              <img
                src={selectedUser?.profilePic || "/avatar.png"}
                alt={selectedUser?.fullName}
                className="w-24 h-24 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-ping w-24 h-24 rounded-full bg-green-500 opacity-75"></div>
              </div>
            </div>
          </div>
          <button onClick={handleCallEnded} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
            End Call
          </button>
        </div>
      )}
      {isAudioReceivingCall && !audioCallAccepted && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-semibold">{incomingAudioCallData.callerName || "Unknown"} is aucalling...</h2>
            <div className="flex justify-center gap-4 mt-4">
              <button onClick={acceptCall} className="bg-green-500 text-white px-4 py-2 rounded-lg">
                Accept
              </button>
              <button onClick={handleRejectCall} className="bg-red-500 text-white px-4 py-2 rounded-lg">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioContainer;