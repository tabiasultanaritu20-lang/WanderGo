const express = require('express');
const {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    deleteUser,
    updateUser,
    profile // <--- 1. Import this new controller function
} = require("../controller/userController");

const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// --- Public Routes ---
router.post("/register", registerUser);
router.post("/login", loginUser);

// --- Protected Routes (Token Required) ---

// 2. Add the profile route (Get current logged-in user)
router.get('/profile', authMiddleware, profile);

router.put('/updateUser/:id', authMiddleware, updateUser);

// --- Admin Only Routes ---
router.get('/getUsers', authMiddleware, adminOnly, getAllUsers);
router.get('/getUser/:id', authMiddleware, adminOnly, getUserById);
router.delete('/deleteUser/:id', authMiddleware, adminOnly, deleteUser);

module.exports = router;