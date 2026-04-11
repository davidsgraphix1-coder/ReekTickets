const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const { connectDB } = require('../config/db');
const router = express.Router();

// Use memory storage instead of disk storage for Vercel compatibility
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const supabase = await connectDB();
    
    if (!supabase) {
      console.error('Supabase client not available');
      return res.status(500).json({ error: 'Database service not available' });
    }

    const filename = `profile-${Date.now()}-${Math.random().toString(36).substring(7)}-${req.file.originalname}`;
    const bucket = 'profile-pictures';

    try {
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filename, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        
        // If bucket doesn't exist, try to create it
        if (error.message && error.message.includes('not found')) {
          console.log('Attempting to create profile-pictures bucket...');
          const { error: createError } = await supabase.storage.createBucket(bucket, {
            public: true,
            allowedMimeTypes: ['image/*']
          });
          
          if (createError) {
            console.error('Bucket creation error:', createError);
            return res.status(500).json({ 
              error: 'Storage service not configured. Please contact support.' 
            });
          }
          
          // Retry upload
          const { data: retryData, error: retryError } = await supabase.storage
            .from(bucket)
            .upload(filename, req.file.buffer, {
              contentType: req.file.mimetype,
              upsert: false
            });
          
          if (retryError) {
            return res.status(500).json({ error: 'Upload failed: ' + retryError.message });
          }
        } else {
          return res.status(500).json({ error: 'Upload failed: ' + error.message });
        }
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filename);

      const url = publicData?.publicUrl;
      
      if (!url) {
        console.error('Could not get public URL for uploaded file');
        return res.status(500).json({ error: 'Could not generate public URL' });
      }
      
      res.json({ url });
    } catch (supabaseError) {
      console.error('Supabase operation error:', supabaseError);
      res.status(500).json({ 
        error: 'Storage service error: ' + (supabaseError.message || 'Unknown error') 
      });
    }
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

module.exports = router;
