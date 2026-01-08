const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

const db = require("./db/db");
const userRouter = require("./route/userRouters");
const blogRouter = require("./route/blogRoutes");
const tourRouter = require("./route/tourRouters");
const reviewRouter = require("./route/reviews");
const emergencyRouter = require("./route/emergencyRoutes");
const safetyRouter = require("./route/safetyRoutes");

// -------------------------------
// CORS setup
app.use(
    cors({
        // FIX: specific origins are required when credentials are true
        origin: ["http://localhost:5173", "http://localhost:5174"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);

// Parse JSON body
app.use(express.json());
// Recommended: Handle standard form submissions
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
// Ensure a folder named 'uploads' exists in your project root
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to DB
db();

// -------------------------------
// Routes
app.use("/api/user", userRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/tours", tourRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/emergency-contacts", emergencyRouter);
app.use("/api", safetyRouter);

// -------------------------------
const port = 8080;

app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});