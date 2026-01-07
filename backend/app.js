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

const emergencyRouter = require("./route/emergencyRoutes");
const safetyRouter = require("./route/safetyRoutes");

// -------------------------------
// CORS setup
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Parse JSON body
app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to DB
db();

// -------------------------------
// Routes
app.use("/api/user", userRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/tours", tourRouter);

app.use("/api/emergency-contacts", emergencyRouter);
app.use("/api", safetyRouter);

// -------------------------------
const port = 8080;

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});