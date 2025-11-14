const express = require('express');
const {registerUser,loginUser, getAllUsers, getUserById, deleteUser, updateUser}=require("../controller/userController");
const {authMiddleware, adminOnly}=require('../middleware/authMiddleware');


const router = express.Router();

router.post("/register",registerUser);
router.post("/login", loginUser);
router.get('/getUsers', authMiddleware, adminOnly, getAllUsers);
router.get('/getUser/:id', authMiddleware, adminOnly, getUserById);
router.put('/updateUser/:id', authMiddleware, updateUser);
router.delete('/deleteUser/:id', authMiddleware, adminOnly, deleteUser);

module.exports = router

