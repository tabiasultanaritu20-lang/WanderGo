const mongoose = require("mongoose")

const connectDB = async () => {
    const mongoURI = "mongodb+srv://ishaqahnafkhan_db_user:HIfTWRaTT0wMTr62@database01.i3jxgke.mongodb.net/?appName=database01";

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