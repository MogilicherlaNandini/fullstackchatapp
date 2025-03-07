import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

const CallContainer = ({ callType, selectedUser }) => {
  const { authUser, socket } = useAuthStore();
  const [isCalling, setIsCalling] = useState(false);
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("offer", handleReceiveCall);
    socket.on("answer", handleAnswer);
    socket.on("candidate", handleCandidate);
    socket.on("call-ended", handleCallEnded);

    return () => {
      socket.off("offer", handleReceiveCall);
      socket.off("answer", handleAnswer);
      socket.off("candidate", handleCandidate);
      socket.off("call-ended", handleCallEnded);
    };
  }, [socket]);

  const handleReceiveCall = async ({ senderId, offer }) => {
    console.log("Incoming call from:", senderId);
    setIsReceivingCall(true);

    peerConnectionRef.current = createPeerConnection();
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);

    socket.emit("answer", { answer, senderId: authUser._id, receiverId: senderId });
  };

  const handleAnswer = async ({ senderId, answer }) => {
    console.log("Call answered by:", senderId);
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      setCallAccepted(true);
    }
  };

  const handleCandidate = async ({ candidate }) => {
    if (peerConnectionRef.current) {
      console.log("Adding ICE candidate:", candidate);
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const handleCallEnded = () => {
    console.log("Call ended");
    endCall();
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate:", event.candidate);
        socket.emit("candidate", {
          candidate: event.candidate,
          senderId: authUser._id,
          receiverId: selectedUser._id,
        });
      }
    };

    pc.ontrack = (event) => {
      console.log("Receiving remote stream...");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return pc;
  };

  const startCall = async () => {
    setIsCalling(true);
    peerConnectionRef.current = createPeerConnection();

    const constraints = callType === "video" ? { video: true, audio: true } : { audio: true };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach(track => peerConnectionRef.current.addTrack(track, stream));

      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      socket.emit("offer", { offer, senderId: authUser._id, receiverId: selectedUser._id });
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const acceptCall = async () => {
    setIsReceivingCall(false);
    setCallAccepted(true);

    const constraints = callType === "video" ? { video: true, audio: true } : { audio: true };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach(track => peerConnectionRef.current.addTrack(track, stream));
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const endCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setIsCalling(false);
    setCallAccepted(false);
    setIsReceivingCall(false);
    socket.emit("call-ended", { senderId: authUser._id, receiverId: selectedUser._id });
  };

  return (
    <div className="call-container">
      {callType === "video" && <video ref={localVideoRef} autoPlay playsInline muted />}
      {callType === "video" && <video ref={remoteVideoRef} autoPlay playsInline />}
      {!isCalling && !isReceivingCall && <button onClick={startCall}>Start Call</button>}
      {isReceivingCall && <button onClick={acceptCall}>Accept Call</button>}
      {callAccepted && <button onClick={endCall}>End Call</button>}
    </div>
  );
};

export default CallContainer;
