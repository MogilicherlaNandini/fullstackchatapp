// import { useRef, useState } from "react";
// import { useChatStore } from "../store/useChatStore";
// import { Image, Send, X } from "lucide-react";
// import toast from "react-hot-toast";

// const MessageInput = () => {
//   const [text, setText] = useState("");
//   const [imagePreview, setImagePreview] = useState(null);
//   const fileInputRef = useRef(null);
//   const { sendMessage } = useChatStore();

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (!file.type.startsWith("image/")) {
//       toast.error("Please select an image file");
//       return;
//     }

//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setImagePreview(reader.result);
//     };
//     reader.readAsDataURL(file);
//   };

//   const removeImage = () => {
//     setImagePreview(null);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!text.trim() && !imagePreview) return;

//     try {
//       await sendMessage({
//         text: text.trim(),
//         image: imagePreview,
//       });

//       // Clear form
//       setText("");
//       setImagePreview(null);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     } catch (error) {
//       console.error("Failed to send message:", error);
//     }
//   };

//   return (
//     <div className="p-4 w-full">
//       {imagePreview && (
//         <div className="mb-3 flex items-center gap-2">
//           <div className="relative">
//             <img
//               src={imagePreview}
//               alt="Preview"
//               className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
//             />
//             <button
//               onClick={removeImage}
//               className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
//               flex items-center justify-center"
//               type="button"
//             >
//               <X className="size-3" />
//             </button>
//           </div>
//         </div>
//       )}

//       <form onSubmit={handleSendMessage} className="flex items-center gap-2">
//         <div className="flex-1 flex gap-2">
//           <input
//             type="text"
//             className="w-full input input-bordered rounded-lg input-sm sm:input-md"
//             placeholder="Type a message..."
//             value={text}
//             onChange={(e) => setText(e.target.value)}
//           />
//           <input
//             type="file"
//             accept="image/*"
//             className="hidden"
//             ref={fileInputRef}
//             onChange={handleImageChange}
//           />

//           <button
//             type="button"
//             className={`hidden sm:flex btn btn-circle
//                      ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
//             onClick={() => fileInputRef.current?.click()}
//           >
//             <Image size={30} />
//           </button>
//         </div>
//         <button
//           type="submit"
//           className="btn btn-sm btn-circle"
//           disabled={!text.trim() && !imagePreview}
//         >
//           <Send size={22} />
//         </button>
//       </form>
//     </div>
//   );
// };
// export default MessageInput;

// import { useRef, useState } from "react";
// import { useChatStore } from "../store/useChatStore";
// import { Paperclip, Send, X } from "lucide-react";
// import toast from "react-hot-toast";

// const MessageInput = () => {
//   const [text, setText] = useState("");
//   const [filePreview, setFilePreview] = useState(null);
//   const [fileName, setFileName] = useState("");
//   const fileInputRef = useRef(null);
//   const { sendMessage } = useChatStore();

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setFilePreview(reader.result);
//       setFileName(file.name);
//     };
//     reader.readAsDataURL(file);
//   };

//   const removeFile = () => {
//     setFilePreview(null);
//     setFileName("");
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!text.trim() && !filePreview) return;

//     try {
//       await sendMessage({
//         text: text.trim(),
//         file: filePreview,
//         fileName: fileName,
//       });

//       // Clear form
//       setText("");
//       setFilePreview(null);
//       setFileName("");
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     } catch (error) {
//       console.error("Failed to send message:", error);
//     }
//   };

//   return (
//     <div className="p-4 w-full">
//       {filePreview && (
//         <div className="mb-3 flex items-center gap-2">
//           <div className="relative">
//             {filePreview.startsWith("data:image/") ? (
//               <img
//                 src={filePreview}
//                 alt="Preview"
//                 className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
//               />
//             ) : (
//               <div className="w-20 h-20 flex items-center justify-center rounded-lg border border-zinc-700">
//                 <span>{fileName}</span>
//               </div>
//             )}
//             <button
//               onClick={removeFile}
//               className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
//               flex items-center justify-center"
//               type="button"
//             >
//               <X className="size-3" />
//             </button>
//           </div>
//         </div>
//       )}

//       <form onSubmit={handleSendMessage} className="flex items-center gap-2">
//         <div className="flex-1 flex gap-2">
//           <input
//             type="text"
//             className="w-full input input-bordered rounded-lg input-sm sm:input-md"
//             placeholder="Type a message..."
//             value={text}
//             onChange={(e) => setText(e.target.value)}
//           />
//           <input
//             type="file"
//             className="hidden"
//             ref={fileInputRef}
//             onChange={handleFileChange}
//           />

//           <button
//             type="button"
//             className={`hidden sm:flex btn btn-circle
//                      ${fileName ? "text-emerald-500" : "text-zinc-400"}`}
//             onClick={() => fileInputRef.current?.click()}
//           >
//             <Paperclip size={30} />
//           </button>
//         </div>
//         <button
//           type="submit"
//           className="btn btn-sm btn-circle"
//           disabled={!text.trim() && !fileName}
//         >
//           <Send size={22} />
//         </button>
//       </form>
//     </div>
//   );
// };
// export default MessageInput;
//..........
import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Paperclip, Send, X, Camera, Mic } from "lucide-react";
import toast from "react-hot-toast";
import Webcam from "react-webcam";

const MessageInput = ({ isGroupChat, groupId }) => {
  const [text, setText] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioPreview, setAudioPreview] = useState(null);
  const [showRecordingControls, setShowRecordingControls] = useState(false);
  const [audioRecordingTime, setAudioRecordingTime] = useState(0); // New state variable for audio recording time
  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const { sendMessage, sendGroupMessage } = useChatStore();

  useEffect(() => {
    let interval;
    if (isAudioRecording) {
      interval = setInterval(() => {
        setAudioRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isAudioRecording]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setFilePreview(null);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !filePreview && !audioPreview) return;

    try {
      const messageData = {
        text: text.trim(),
        file: filePreview ? filePreview.split(',')[1] : (audioPreview ? audioPreview.split(',')[1] : null), // Send base64 content
        fileName: fileName || (audioPreview ? "audio.webm" : ""),
      };

      if (isGroupChat) {
        await sendGroupMessage(groupId, messageData);
      } else {
        await sendMessage(messageData);
      }

      toast.success("Message sent!");

      // Clear form
      setText("");
      setFilePreview(null);
      setFileName("");
      setAudioPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message.");
    }
  };

  const handleCapturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result); // Base64 image
          setFileName("photo.jpg");
          setIsCameraOpen(false);
        };
        reader.readAsDataURL(blob);
      });
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm;codecs=vp8,opus",
    });
    mediaRecorderRef.current.addEventListener("dataavailable", handleDataAvailable);
    mediaRecorderRef.current.start();
    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    mediaRecorderRef.current.addEventListener("stop", () => clearInterval(interval));
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    mediaRecorderRef.current.stop();
  };

  const handleDataAvailable = ({ data }) => {
    if (data.size > 0) {
      setRecordedChunks((prev) => prev.concat(data));
    }
  };

  const handleSaveRecording = () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result); // Base64 video
      setFileName("video.webm");
      setRecordedChunks([]);
      setIsCameraOpen(false);
    };
    reader.readAsDataURL(blob);
  };

  const handleStartAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsAudioRecording(true);
      setAudioChunks([]); // Reset previous recordings

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      audioRecorderRef.current = recorder;

      const chunks = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioPreview(reader.result); // Convert to Base64
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
    } catch (error) {
      console.error("Failed to start audio recording:", error);
      toast.error("Failed to start audio recording.");
    }
  };

  const handleStopAudioRecording = () => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      setIsAudioRecording(false);
    }
  };

  const removeAudio = () => {
    setAudioPreview(null);
    setAudioChunks([]);
  };

  return (
    <div className="p-4 w-full relative">
      {filePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            {filePreview.startsWith("data:image/") ? (
              <img
                src={filePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
              />
            ) : filePreview.startsWith("data:video/") ? (
              <video
                src={filePreview}
                controls
                className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
              />
            ) : (
              <audio
                src={filePreview}
                controls
                className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
              />
            )}
            <button
              onClick={removeFile}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {audioPreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <audio
              src={audioPreview}
              controls
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeAudio}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${fileName ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={30} />
          </button>
          <button
            type="button"
            className="hidden sm:flex btn btn-circle text-zinc-400"
            onClick={() => setIsCameraOpen(true)}
          >
            <Camera size={30} />
          </button>
          <button
            type="button"
            className="hidden sm:flex btn btn-circle text-zinc-400"
            onClick={() => setShowRecordingControls(!showRecordingControls)}
          >
            <Mic size={30} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !fileName && !audioPreview}
        >
          <Send size={22} />
        </button>
      </form>
      
      {showRecordingControls && (
        <div className="flex gap-2 mt-2">
          {isAudioRecording ? (
            <button
              className="btn btn-danger"
              onClick={handleStopAudioRecording}
            >
              Stop Recording ({audioRecordingTime}s)
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleStartAudioRecording}
            >
              Start Recording
            </button>
          )}
        </div>
      )}

      {isCameraOpen && (
        <div className="flex flex-col items-center">
          <Webcam
            audio={true}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-64 h-64 object-cover rounded-lg border-2 border-white"
            videoConstraints={{ width: 256, height: 256, facingMode: "user" }}
          />
          <div className="flex gap-2 mt-4">
            <button
              className="btn btn-primary"
              onClick={handleCapturePhoto}
            >
              Capture Photo
            </button>
            {isRecording ? (
              <button
                className="btn btn-danger"
                onClick={handleStopRecording}
              >
                Stop Recording ({recordingTime}s)
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleStartRecording}
              >
                Start Recording
              </button>
            )}
            <button
              className="btn btn-secondary"
              onClick={() => setIsCameraOpen(false)}
            >
              Close
            </button>
          </div>
          {recordedChunks.length > 0 && (
            <button
              className="btn btn-success mt-2"
              onClick={handleSaveRecording}
            >
              Save Recording
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageInput;