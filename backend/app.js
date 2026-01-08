const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

const db = require("./db/db");
const userRouter = require("./route/userRouters");
const blogRouter = require("./route/blogRoutes");
const uploadRouter = require("./route/uploadRoutes");
const tourRouter = require("./route/tourRouters");
const packageRouter = require("./route/packageRoutes");
const spotRouter = require("./route/spotRoutes");
const documentRouter = require("./route/documentRoutes");
const visaRouter = require("./route/visaRoutes");
const chatRouter = require("./route/chatRoutes");
const reviewRouter = require("./route/reviews");
const emergencyRouter = require("./route/emergencyRoutes");
const safetyRouter = require("./route/safetyRoutes");
const { ensureSeededEmergency } = require('./controller/emergencyController');

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

// Seed defaults (emergency contacts)
ensureSeededEmergency();

// -------------------------------
// Routes
app.use("/api/user", userRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/tours", tourRouter);
app.use("/api/packages", packageRouter);
app.use('/api/spots', spotRouter);
app.use('/api/documents', documentRouter);
app.use('/api/visa', visaRouter);
app.use('/api/chat', chatRouter);

app.use("/api/reviews", reviewRouter);
app.use("/api/emergency-contacts", emergencyRouter);
app.use("/api", safetyRouter);

// -------------------------------
const port = Number(process.env.PORT) || 8080;

app.get('/', (req, res) => {
    res.status(200).send('WanderGo backend is running. See /api/* for endpoints.');
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
