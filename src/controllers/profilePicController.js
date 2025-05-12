const supabase =require('../config/db'); // Your initialized supabase client
const multer = require('multer');
const path = require('path');

// Setup multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.body.userId;
    const file = req.file;

    if (!userId || !file) {
      return res.status(400).json({ message: 'User ID and file are required' });
    }

    // Create a unique file name
    const fileExt = path.extname(file.originalname);
    const fileName = `user_${userId}_${Date.now()}${fileExt}`;

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('profilepictures')
      .upload(fileName, file.buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.mimetype,
      });

    if (uploadError) {
      console.error(uploadError);
      return res.status(500).json({ message: 'Failed to upload image' });
    }

    const publicUrl = supabase
      .storage
      .from('profilepictures')
      .getPublicUrl(fileName).data.publicUrl;

    // Update user's profile_pic in users table
    const { error: dbError } = await supabase
      .from('users')
      .update({ profile_pic: publicUrl })
      .eq('user_id', userId);

    if (dbError) {
      console.error(dbError);
      return res.status(500).json({ message: 'Failed to update user profile picture' });
    }

    res.status(200).json({ message: 'Profile picture updated successfully', profilePicUrl: publicUrl });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.uploadMiddleware = upload.single('profilePic'); // for the route
