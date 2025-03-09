import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const CallContainer = ({ selectedUser, onEndCall, localVideoRef, remoteVideoRef, peerConnectionRef, iceCandidateQueue }) => {
  const { authUser } = useAuthStore();
  const { isReceivingCall, setReceivingCall, incomingCallData, setIncomingCallData, callAccepted, setCallAccepted } = useChatStore();
  const socket = useAuthStore((state) => state.socket);

  const [remoteStream, setRemoteStream] = useState(null); // State to store the remote stream

  useEffect(() => {
    if (!socket) return;

    socket.on("offer", handleReceiveCall);
    socket.on("answer", handleAnswer);
    socket.on("candidate", handleCandidate);
    socket.on("call-ended", handleCallEnded);
    socket.on("call-accepted", handleCallAccepted);

    return () => {
      socket.off("offer", handleReceiveCall);
      socket.off("answer", handleAnswer);
      socket.off("candidate", handleCandidate);
      socket.off("call-ended", handleCallEnded);
      socket.off("call-accepted", handleCallAccepted);
    };
  }, [socket]);

  useEffect(() => {
    if (selectedUser && authUser) {
      startCall();
    }
  }, [selectedUser, authUser]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleCallEnded = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    [localVideoRef, remoteVideoRef].forEach(ref => {
      if (ref.current?.srcObject) {
        ref.current.srcObject.getTracks().forEach(track => track.stop());
        ref.current.srcObject = null;
      }
    });

    setCallAccepted(false);
    setReceivingCall(false);
    setIncomingCallData(null);
    onEndCall();
  };

  const handleCallAccepted = async ({ answer }) => {
    if (!peerConnectionRef.current) return;
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    setCallAccepted(true);
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
    setCallAccepted(true);
  };

  const handleReceiveCall = async ({ offer, senderId, callerName }) => {
    console.log("Received offer:", offer);
    setReceivingCall(true);
    setIncomingCallData({ offer, senderId, callerName });
    peerConnectionRef.current = createPeerConnection();
    peerConnectionRef.current.offerData = offer;
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && incomingCallData) {
        socket.emit("candidate", { candidate: event.candidate, senderId: authUser._id, receiverId: incomingCallData.senderId });
      }
    };

    pc.ontrack = (event) => {
      console.log("Receiving remote track:", event.streams[0]);
      setRemoteStream(event.streams[0]);
    };

    return pc;
  };

  const startCall = async () => {
    if (!peerConnectionRef.current) {
      peerConnectionRef.current = createPeerConnection();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach(track => peerConnectionRef.current.addTrack(track, stream));

      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      console.log("Sending offer:", offer);
      socket.emit("offer", { 
        offer, 
        senderId: authUser._id, 
        receiverId: selectedUser._id, 
        callerName: authUser.fullName 
      });
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  const acceptCall = async () => {
    console.log("Accepting call");
    if (!peerConnectionRef.current) {
      peerConnectionRef.current = createPeerConnection();
    }

    try {
      setReceivingCall(false);
      setCallAccepted(true);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach(track => peerConnectionRef.current.addTrack(track, stream));

      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(incomingCallData.offer));

      while (iceCandidateQueue.current.length) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(iceCandidateQueue.current.shift()));
      }

      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      console.log("Sending answer:", answer);
      socket.emit("answer", { 
        answer, 
        senderId: authUser._id, 
        receiverId: incomingCallData.senderId 
      });

      setIncomingCallData(null);
    } catch (error) {
      console.error("Error accepting call:", error);
    }
  };

  const handleRejectCall = () => {
    if (!incomingCallData) return; // Prevent rejecting call if incomingCallData is null
    console.log("Rejecting call from:", incomingCallData.callerName);
    socket.emit("call-rejected", { senderId: incomingCallData.senderId, receiverId: authUser._id });
    setIncomingCallData(null);
    setReceivingCall(false);
  };

  return (
    <div className="call-container">
      <video ref={localVideoRef} autoPlay playsInline muted />
      <video ref={remoteVideoRef} autoPlay playsInline />
      {isReceivingCall && !callAccepted && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-semibold">{incomingCallData.callerName || "Unknown"} is calling...</h2>
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
      {callAccepted && <button onClick={handleCallEnded}>End Call</button>}
    </div>
  );
};

export default CallContainer;