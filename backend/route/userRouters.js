const express = require('express');
const {registerUser,loginUser, getAllUsers, getUserById, deleteUser, updateUser}=require("../controller/userController");
const router = express.Router();

router.post("/register",registerUser);
router.post("/login", loginUser);
router.get('/getUsers', getAllUsers);
router.get('/getUser/:id', getUserById);
router.put('/updateUser/:id', updateUser);
router.delete('/deleteUser/:id', deleteUser);

module.exports = router

