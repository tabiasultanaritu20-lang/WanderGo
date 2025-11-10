const mongoose = require("mongoose")

const connectDB = async () => {
    const mongoURI = "#";

    if (!mongoURI) {
        console.error("MONGODB_URL is not defined.");
        return;
    }

    try {
        await mongoose.connect(mongoURI);
        console.log("MongoDB Connected");
    } catch (e) {
        console.error("MongoDB connection failed:", e);
    }
};
module.exports = connectDB;