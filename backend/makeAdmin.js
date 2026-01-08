const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./db/db');
const User = require('./model/userModel');

const makeAdmin = async () => {
    // 1. Connect to DB
    const isConnected = await connectDB();
    if (!isConnected) {
        console.error("Failed to connect to DB");
        process.exit(1);
    }

    try {
        // 2. Find User
        const userName = "Nabil"; 
        const user = await User.findOne({ name: userName });

        if (!user) {
            console.log(`User "${userName}" not found.`);
            // List all users to help debug
            const allUsers = await User.find({}, 'name role');
            console.log("Available users:", allUsers.map(u => `${u.name} (${u.role})`).join(", "));
            process.exit(1);
        }

        // 3. Update Role
        user.role = "admin";
        await user.save();

        console.log(`SUCCESS: User "${user.name}" is now an ADMIN.`);
    } catch (error) {
        console.error("Error updating user:", error);
    } finally {
        // 4. Close connection
        await mongoose.disconnect();
        process.exit(0);
    }
};

makeAdmin();
