const multer = require('multer');
const path = require('path');

// Configure where to store the images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure this folder exists or create it manually: backend/uploads
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Create unique filename: fieldname-timestamp.jpg
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// File filter (Optional: only accept images)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 } // Limit to 5MB
});

module.exports = upload;