import { useState, useEffect, useRef } from "react";
import lighthouse from "@lighthouse-web3/sdk";

function App() {
  const [files, setFiles] = useState([]); 
  const [fileContent, setFileContent] = useState<{text:string, cid:string} | null>(null); 
  const fileInputRef = useRef(null); 
  const API_KEY = import.meta.env.VITE_LIGHTHOUSE_API_KEY; 

  // Fetch uploaded files from Lighthouse
  const getUploads = async () => {
    try {
      const response = await lighthouse.getUploads(API_KEY, null);
      setFiles(response?.data?.fileList || []);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const viewFileContent = async (cid) => {
    try {
      const response = await fetch(`https://gateway.lighthouse.storage/ipfs/${cid}`);
      if (!response.ok) throw new Error("Failed to fetch file");
      const text = await response.text(); 
      setFileContent({ text, cid });
    } catch (error) {
      console.error("Error fetching file content:", error);
    }
  };

  const uploadFile = async (file) => {
    if (!file) return;
    
    try {
      const progressCallback = (progressData) => {
        if (typeof progressData?.progress !== "number") {
          console.log("Invalid progress data:", progressData);
          return;
        }
      
        let percentageDone = (progressData.progress * 100).toFixed(2);
        console.log(`Upload Progress: ${percentageDone}%`);
      };
         
      console.log("Uploading file...");
      const output = await lighthouse.upload([file], API_KEY, null, progressCallback);
      
      console.log("File uploaded:", output);
      getUploads(); // Refresh file list after upload
      
      if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input
    } catch (error) {
      console.error("File upload failed:", error);
    }
  };

  useEffect(() => {
    getUploads(); 
  }, []);

  return (
    <div className="w-full bg-neutral-950 min-h-screen p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Lighthouse File Manager</h1>

      {/* File Upload */}
      <input
        ref={fileInputRef}
        type="file"
        className="bg-neutral-800 p-2 rounded-md mb-4"
        onChange={(e) => uploadFile(e.target.files[0])}
      />

      {/* File List */}
      <h2 className="text-xl font-semibold mt-4">Uploaded Files:</h2>
      {files.length === 0 ? (
        <p className="text-gray-400">No files uploaded yet.</p>
      ) : (
        <ul className="mt-2">
          {files.map((file) => (
            <li key={file.cid} className="flex items-center gap-4 mb-2">
              <span className="text-sm text-gray-300">{file.fileName || "Unnamed File"}</span>
              <button
                onClick={() => viewFileContent(file.cid)}
                className="bg-blue-600 text-white px-3 py-1 rounded cursor-pointer"
              >
                View Content
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* File Content Preview */}
      {fileContent && (
        <div className="mt-6 p-4 bg-gray-800 rounded-md relative">
          <h3 className="text-lg font-semibold mb-2">File Preview</h3>
          <button 
            className="absolute top-2 right-5 text-white text-xl cursor-pointer"
            onClick={()=>setFileContent(null)}
          >
            X
          </button>
          <pre className="text-sm bg-gray-900 p-2 rounded">{fileContent.text}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
