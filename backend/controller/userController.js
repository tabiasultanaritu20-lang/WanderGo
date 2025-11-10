const User=require("../model/userModel");

const bcrypt=require("bcrypt");
// import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
    try {
        const { name, email, password, number, country } = req.body;

        // ✅ 1. Check if all required fields exist
        if (!name || !email || !password || !number || !country) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // ✅ 2. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // ✅ 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ 4. Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            number,
            country,
        });

        await user.save();

        // // ✅ 5. Generate JWT token
        // const token = jwt.sign(
        //     { id: user._id, email: user.email },
        //     process.env.JWT_SECRET,
        //     { expiresIn: "7d" }
        // );

        // ✅ 6. Send response
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                number: user.number,
                country: user.country,
            },
            // token,
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports= registerUser;


