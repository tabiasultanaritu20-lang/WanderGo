const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ======================== REGISTER USER ========================
const registerUser = async (req, res) => {
    try {
        // Destructure all possible input fields including new ones like 'city'
        let { name, email, password, number, country, city, role, adminKey } = req.body;

        // 1. Check if all required fields exist (Added city if you want it required, otherwise remove it)
        if (!name || !email || !password || !number || !country) {
            return res.status(400).json({ message: "All required fields (name, email, password, number, country) must be provided" });
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const requestedRole = (role || "user").toLowerCase();

        // Handle admin role
        if (requestedRole === "admin") {
            if (adminKey !== process.env.ADMIN_ROLE) {
                return res.status(403).json({ message: "Not allowed to create admin user" });
            }
            role = "admin";
        }
        // Handle agency role
        else if (requestedRole === "agency") {
            role = "agency";
        }
        // Default role
        else {
            role = "user";
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            number,
            country,
            city, // Added city
            role
        });

        await user.save();

        // 5. Generate JWT token (Standardized Payload)
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 6. Send response
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                email: user.email,
                number: user.number,
                country: user.country,
                city: user.city,
            },
            token,
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ======================== LOGIN USER ========================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: "Email and password required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        // Generate Token (Matches Register Payload)
        const token = jwt.sign({
            id: user._id,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                number: user.number,
                country: user.country,
                city: user.city,
                role: user.role,
                profilePictureUrl: user.profilePictureUrl
            },
            token,
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ======================== GET ALL USERS ========================
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ======================== GET USER BY ID ========================
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        console.error("Get User Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ======================== UPDATE USER ========================
const updateUser = async (req, res) => {
    try {
        // Expanded to include new profile fields
        const {
            name,
            email,
            number,
            country,
            city,
            description,
            profilePictureUrl,
            socialLinks
        } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                name,
                email,
                number,
                country,
                city,
                description,
                profilePictureUrl,
                socialLinks
            },
            { new: true, runValidators: true } // runValidators ensures country enum is checked
        ).select("-password");

        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        res.json({ message: "User updated successfully", updatedUser });
    } catch (error) {
        console.error("Update User Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ======================== DELETE USER ========================
const deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: "User not found" });

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ======================== PROFILE (Authenticated) ========================
const profile = async (req, res) => {
    try {
        // NOTE: This assumes you have authentication middleware (like verifyToken)
        // that adds the decoded user info to req.user

        // If your middleware sets req.user.id or req.user._id:
        const userId = req.user.id || req.user._id;

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User profile not found" });
        }

        res.json({
            message: "User Profile Fetched",
            user
        });
    } catch (error) {
        console.error("Profile Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ======================== EXPORT ALL ========================
module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    profile,
};