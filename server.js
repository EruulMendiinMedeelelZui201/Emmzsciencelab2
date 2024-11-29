const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const bodyParser = require('body-parser');
const User = require('./models/User');  // Define your User model
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files (e.g., for HTML, CSS)

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/emmz', { useNewUrlParser: true, useUnifiedTopology: true });

// File upload setup (using multer)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Routes

// Teacher Login (Role-Based)
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', user });
});

// Teacher Content Upload (Admin only)
app.post('/api/teacher/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Save file info in the database or process as needed
    res.json({ message: 'File uploaded successfully', file: req.file });
});

// Default route for students to directly enter
app.get('/student-dashboard.html', (req, res) => {
    res.sendFile(__dirname + '/public/student-dashboard.html');
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
