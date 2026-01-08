const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// 1. Configure Multer (Where to save and what to name the file)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // This saves to the 'uploads' folder in your backend root
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Naming the file: fieldname + date + extension
        // Example: image-123456789.jpg
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 2. The Route definition
// This creates a POST route at /api/upload
router.post('/', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    
    // We send back the URL so your frontend can display the image later
    res.send({
        message: 'File uploaded successfully!',
        filePath: `/uploads/${req.file.filename}`
    });
});

module.exports = router;