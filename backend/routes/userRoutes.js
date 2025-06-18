// backend/routes/userRoutes.js
const express = require('express');
const fs = require('fs'); // Require file system module
const path = require('path'); // Require path module
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const upload = require('../config/multerConfig'); // Import configured multer instance

const router = express.Router();

// @route   PUT /api/users/profile/picture
// @desc    Upload local profile picture and update user
// @access  Private
router.put(
    '/profile/picture',
    protect, // 1. Auth middleware runs first

    // Middleware to log request arrival (optional, but helpful for debugging)
    (req, res, next) => {
        console.log(`Backend PUT /profile/picture: Request received for user ${req.user?.id}, attempting upload...`);
        next();
    },

    upload.single('profilePicture'), // 2. Multer middleware processes the file upload

    // Main route handler (runs AFTER multer)
    async (req, res, next) => { // Added next for potential error forwarding
        const userId = req.user.id;
        console.log('Backend PUT /profile/picture: Multer processed. req.file:', req.file ? 'Exists' : 'MISSING'); // Log if file exists

        // --- Check if Multer processed a file ---
        // Multer adds req.file if upload is successful for the given field name
        if (!req.file) {
            console.log('Backend PUT /profile/picture: Multer did not find a file for field "profilePicture".');
            // Note: Multer errors (like wrong type/size) should ideally be caught
            // by the Multer error handling middleware in server.js now.
            // This check handles cases where the field name might be wrong in the request.
            return res.status(400).json({ message: 'No image file found in request. Make sure the field name is "profilePicture".' });
        }
        // -----------------------------------------

        // 'req.file' contains info about the uploaded file on the server
        // req.file.path => Full path on server (e.g., D:\...\backend\uploads\avatars\profilePicture-userid-timestamp.png)
        // req.file.filename => The generated unique filename (e.g., profilePicture-userid-timestamp.png)

        // --- Construct the URL path for frontend access ---
        // This path must match how you serve static files in server.js
        const fileUrlPath = `/uploads/avatars/${req.file.filename}`;
        console.log('Backend PUT /profile/picture: File details:', req.file);
        console.log('Backend PUT /profile/picture: Generated URL Path for DB:', fileUrlPath);
        // -------------------------------------------------

        try {
            const user = await User.findById(userId);
            if (!user) {
                console.log('Backend PUT /profile/picture: User not found.');
                // If user not found, delete the uploaded file as it's orphaned
                fs.unlink(req.file.path, (err) => { // Use fs.unlink for async delete
                   if (err) console.error("Error deleting orphaned upload:", req.file.path, err);
                   else console.log("Deleted orphaned upload:", req.file.path);
                });
                return res.status(404).json({ message: 'User not found.' });
            }

            // --- Delete Old File from Server Filesystem ---
            const oldUrlPath = user.profilePictureUrl;
            // Check if there was a previous picture, it's not null/empty, AND it points to a local upload (not the default path)
            if (oldUrlPath && oldUrlPath.startsWith('/uploads/avatars/')) {
                try {
                     const oldFileName = path.basename(oldUrlPath); // Extract just filename
                     // Construct the absolute path to the old file on the server
                     const oldFilePath = path.join(path.dirname(req.file.path), oldFileName); // Use dirname of current upload + old filename
                     // Safter Alternative using UPLOAD_DIR from config (if exported):
                     // const oldFilePath = path.join(UPLOAD_DIR, oldFileName); // Assumes UPLOAD_DIR is exported from multerConfig

                     console.log('Attempting to delete old file:', oldFilePath);

                     // Use async unlink and check existence first
                     if (fs.existsSync(oldFilePath)) {
                         await fs.promises.unlink(oldFilePath); // Use async unlink with await
                         console.log('Successfully deleted old file:', oldFilePath);
                     } else {
                         console.log('Old file path not found on disk, skipping delete:', oldFilePath);
                     }
                } catch (deleteError) {
                    console.error("Error occurred while trying to delete old profile picture file:", deleteError);
                    // Don't necessarily block the update if deletion fails, just log it
                }
            }
            // --- End Delete Old File ---

            // Update user record with the new relative URL path
            user.profilePictureUrl = fileUrlPath;
            await user.save();
            console.log('Backend PUT /profile/picture: User document updated successfully.');

            // Return updated user info (excluding sensitive fields like password)
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                // Add other non-sensitive fields as needed
                level: user.level,
                xp: user.xp,
                achievements: user.achievements,
                profilePictureUrl: user.profilePictureUrl // The new relative path
            });

        } catch (error) {
            console.error("Backend PUT /profile/picture: Error during DB save or file operations:", error);
            // If DB save fails after upload, attempt to delete the newly uploaded file
            // Use async unlink within the catch block
            try {
                await fs.promises.unlink(req.file.path);
                console.log("Deleted newly uploaded file due to DB error:", req.file.path);
            } catch (unlinkErr) {
                console.error("Error deleting uploaded file after DB error:", req.file.path, unlinkErr);
                // Log this second error but proceed to send the original error response
            }
            // Forward error to generic error handler OR send specific response
            // next(error); // Option 1: Forward to generic handler
            res.status(500).json({ message: 'Server error updating profile picture.' }); // Option 2: Specific response
        }
    }
);


// --- You might add other profile update routes here later ---
// Example: Update username
router.put('/profile/username', protect, async (req, res) => {
    const { newUsername } = req.body;
    const userId = req.user.id;

    if (!newUsername || typeof newUsername !== 'string' || newUsername.trim().length < 3) {
        return res.status(400).json({ message: 'Username must be at least 3 characters.' });
    }
    // Add check for username uniqueness if needed
    // const existingUser = await User.findOne({ username: newUsername.trim() });
    // if (existingUser && existingUser._id.toString() !== userId) {
    //     return res.status(400).json({ message: 'Username already taken.' });
    // }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { username: newUsername.trim() } },
            { new: true, runValidators: true, select: '-password' } // Exclude password
        );
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.json(updatedUser);
    } catch(error) {
        console.error("Error updating username:", error);
        res.status(500).json({ message: 'Server error updating username.' });
    }
});


module.exports = router; // Ensure this is at the end