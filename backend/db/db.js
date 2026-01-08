const mongoose = require("mongoose");

const connectDB = async () => {
    const mongoURI = process.env.MONGOURI;
    if (!mongoURI) {
        console.warn("MONGOURI is not defined in environment variables. Skipping MongoDB connection.");
        return false;
    }

    try {
        await mongoose.connect(mongoURI);
        console.log("MongoDB Connected");
        return true;
    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        return false;
    }
};

module.exports = connectDB;
