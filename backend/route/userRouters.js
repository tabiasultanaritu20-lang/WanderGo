const express = require('express');
const {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    deleteUser,
    updateUser,
    profile
} = require("../controller/userController");

const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Import Multer

const router = express.Router();

// --- Public Routes ---
router.post("/register", registerUser);
router.post("/login", loginUser);

// --- Protected Routes ---
router.get('/profile', authMiddleware, profile);

// --- Public/Shared Routes ---
// Allow logged-in users to view other profiles (Removed adminOnly based on previous steps)
router.get('/getUser/:id', authMiddleware, getUserById);

// --- Update User (WITH IMAGE UPLOAD) ---
// This is the ONLY update route you need.
// It handles both text-only updates AND image uploads.
router.put('/updateUser/:id', authMiddleware, upload.single('profilePicture'), updateUser);

// --- Admin Only Routes ---
router.get('/getUsers', authMiddleware, adminOnly, getAllUsers); // Recommended: Keep list restricted
router.delete('/deleteUser/:id', authMiddleware, adminOnly, deleteUser);

module.exports = router;