import React, { useRef, useState } from 'react';
import axios from 'axios';

export default function ProfilePicUpload({ avatarUrl, onUpload, disabled }) {
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('/api/upload', formData);
      if (res.data.url) {
        onUpload(res.data.url);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <img
        src={avatarUrl || '/default-avatar.png'}
        alt="Profile"
        style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: 8, border: '2px solid #a855f7' }}
      />
      <br />
      <button
        type="button"
        onClick={() => fileInput.current.click()}
        disabled={uploading || disabled}
        style={{ margin: '0.5em 0', padding: '0.4em 1.2em', borderRadius: 20, background: '#a855f7', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        {uploading ? 'Uploading...' : 'Change Photo'}
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInput}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={uploading || disabled}
      />
    </div>
  );
}
