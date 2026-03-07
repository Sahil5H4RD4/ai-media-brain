"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function FileUpload({ onFileSelect, accept, maxFiles = 1, maxSize = 10485760, label = "Upload File" }) {
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    setError(null);

    // Handle rejections
    if (fileRejections.length > 0) {
      const errorMsg = fileRejections[0].errors[0];
      if (errorMsg.code === "file-too-large") {
        setError(`File is larger than ${(maxSize / (1024 * 1024)).toFixed(0)}MB`);
      } else if (errorMsg.code === "file-invalid-type") {
        setError("Invalid file type.");
      } else {
        setError(errorMsg.message);
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
  });

  return (
    <div className="w-full">
      <div 
        {...getRootProps()} 
        className={`relative cursor-pointer overflow-hidden group p-8 rounded-xl border-2 border-dashed transition-all duration-300 ease-in-out ${
          isDragActive 
            ? "border-[var(--secondary)] bg-[var(--secondary)]/10" 
            : "border-gray-600 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center text-center z-10 relative">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
            isDragActive ? "bg-[var(--secondary)]/20 text-[var(--secondary)] scale-110" : "bg-gray-800 text-gray-400 group-hover:bg-[var(--primary)]/20 group-hover:text-[var(--primary)]"
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <p className="text-lg font-medium text-white mb-1">
            {isDragActive ? "Drop the file here" : label}
          </p>
          <p className="text-sm text-gray-400">
            Drag & drop or click to browse
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-400 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
