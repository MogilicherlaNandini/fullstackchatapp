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
import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Paperclip, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import CryptoJS from "crypto-js";

const SECRET_KEY = "my_secret_key_123"; // Should be stored securely

// Encrypt function
const encryptData = (text) => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

const MessageInput = () => {
  const [text, setText] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

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
    if (!text.trim() && !filePreview) return;
  
    // Encrypt message if text is present
    const encryptedText = text.trim() ? encryptData(text.trim()) : "";
  
    // Show full encrypted message in toast (for text & files)
    const toastId = toast.custom((t) => (
      <div className={`bg-gray-900 text-white p-4 rounded-lg shadow-lg w-96 ${t.visible ? "animate-fade-in" : "animate-fade-out"}`}>
        <h3 className="text-lg font-semibold mb-2">🔒 Encrypting Message...</h3>
        {text && (
          <>
            <p><strong>Original:</strong> {text}</p>
            <p className="break-all"><strong>Encrypted:</strong> {encryptedText}</p>
          </>
        )}
        {filePreview && (
          <>
            <p className="mt-2"><strong>File:</strong> {fileName}</p>
            <p className="break-all"><strong>File Preview:</strong> <img src={filePreview} alt="Preview" className="w-20 h-20 rounded-lg border" /></p>
          </>
        )}
      </div>
    ), {
      position: "top-center",
      duration: 3000,
    });
  
    setTimeout(async () => {
      toast.dismiss(toastId);
  
      try {
        await sendMessage({
          text: encryptedText, // Encrypt text but NOT files
          file: filePreview,   // Don't encrypt, just send URL
          fileName: fileName,  // Don't encrypt filename
        });
  
        toast.success("✅ Message sent!", { position: "top-center" });
  
        // Clear form
        setText("");
        setFilePreview(null);
        setFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (error) {
        console.error("Failed to send message:", error);
        toast.error("❌ Failed to send message.", { position: "top-center" });
      }
    }, 3000);
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
            ) : (
              <div className="w-20 h-20 flex items-center justify-center rounded-lg border border-zinc-700">
                <span>{fileName}</span>
              </div>
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
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !fileName}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
