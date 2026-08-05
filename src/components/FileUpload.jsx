import React, { useState } from 'react';
import { documentAPI } from '../services/api';
import toast from 'react-hot-toast';

const FileUpload = ({ onUpload, label = "Upload File", accept = ".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx" }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      const response = await documentAPI.upload(file);
      if (response.data?.success) {
        toast.success(`File "${file.name}" uploaded successfully!`);
        if (onUpload) onUpload(response.data.data);
        setFile(null);
        // Clear the input
        const input = document.getElementById('file-input');
        if (input) input.value = '';
      } else {
        toast.error(response.data?.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Upload failed. Check console for details.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-mint-500 transition-colors">
      <input
        id="file-input"
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />
      <label htmlFor="file-input" className="cursor-pointer block">
        <div className="flex flex-col items-center gap-2">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-gray-600">
            {file ? (
              <span className="text-mint-600 font-medium">{file.name}</span>
            ) : (
              <span>Click or drag to upload <span className="text-mint-600 font-medium">{label}</span></span>
            )}
          </p>
          <p className="text-xs text-gray-400">
            {accept.split(',').join(', ')} (Max 10MB)
          </p>
        </div>
      </label>
      {file && (
        <button 
          onClick={handleUpload}
          disabled={uploading}
          className="btn-primary text-sm px-4 py-2 mt-3"
        >
          {uploading ? 'Uploading...' : 'Upload Now'}
        </button>
      )}
    </div>
  );
};

export default FileUpload;
