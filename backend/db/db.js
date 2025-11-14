const mongoose = require("mongoose");

const connectDB = async () => {
    const mongoURI = process.env.MONGOURI;
    if (!mongoURI) {
        console.error("MONGOURI is not defined in environment variables.");
        process.exit(1)
    }

    try {
        await mongoose.connect(mongoURI);
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
