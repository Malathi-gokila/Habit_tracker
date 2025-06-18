// backend/config/multerConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // File system module

// Define the storage directory relative to the backend root
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'avatars'); // Go up from config, then into uploads/avatars

// --- Ensure the upload directory exists ---
if (!fs.existsSync(UPLOAD_DIR)) {
    console.log(`Creating upload directory: ${UPLOAD_DIR}`);
    // Create nested directories if they don't exist
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} else {
    console.log(`Upload directory already exists: ${UPLOAD_DIR}`);
}
// -----------------------------------------

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Use the absolute path ensured above
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        // Create a unique filename: fieldname-userid-timestamp.extension
        const userId = req.user ? req.user.id : 'unknown'; // Get userId from authenticated user
        const uniqueSuffix = userId + '-' + Date.now();
        const extension = path.extname(file.originalname); // Get original extension
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

// --- File Filter (Optional but recommended) ---
// backend/config/multerConfig.js
const fileFilter = (req, file, cb) => {
    console.log(`Multer Filter: Checking file - Original Name: ${file.originalname}, Mimetype: ${file.mimetype}`); // Log details
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        console.log("Multer Filter: File type ACCEPTED.");
        return cb(null, true);
    } else {
        console.log(`Multer Filter: File type REJECTED. Mimetype: ${mimetype}, Extname check: ${extname}`);
        // Pass an error message that can be caught
        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Error: Images Only! (jpg, png, gif)'), false);
    }
};
// -------------------------------------------

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB (example)
    fileFilter: fileFilter // Apply the file filter
});

module.exports = upload; // Export the configured multer instance