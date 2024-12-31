import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PDFUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    backendurl = process.env.REACT_APP_BACKEND_URL
    const uploadPdfUrl = `${backendUrl}/upload-pdf`;
    
    setLoading(true);
    try {
      const response = await axios.post(uploadPdfUrl, formData);
      onUploadSuccess(response.data.pdf_id);
      navigate('/generate');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload PDF');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full"
          />
        </div>
        <button
          type="submit"
          disabled={!file || loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Uploading...' : 'Upload PDF'}
        </button>
      </form>
    </div>
  );
};

export default PDFUpload;