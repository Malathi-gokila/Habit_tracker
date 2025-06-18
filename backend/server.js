const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path'); // Import path module

// Load env vars
dotenv.config();

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors()); // Enable All CORS Requests for simplicity in dev
app.use(express.json()); // Body parser for JSON

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/habits', require('./routes/habitRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes.js'));
app.use('/api/users', require('./routes/userRoutes'));
// Add other routes here (e.g., user profile)

// Basic Route
app.get('/', (req, res) => res.send('Habit Tracker API Running'));

// --- Multer Error Handling Middleware ---
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        console.error("Multer Error:", err);
        // Customize response based on error code
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Max size is 5MB.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
             return res.status(400).json({ message: 'Invalid file type. Only JPG, PNG, GIF allowed.' });
        }
        // Generic Multer error
        return res.status(400).json({ message: `File upload error: ${err.message}` });
    } else if (err) {
        // Handle other errors (delegate to generic error handler)
        next(err); // Pass to the next error handler
    } else {
        next(); // No error, continue
    }
});
// --- End Multer Error Handling ---


// Your existing generic error handler
app.use((err, req, res, next) => {
    console.error("Generic Error Stack:", err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));