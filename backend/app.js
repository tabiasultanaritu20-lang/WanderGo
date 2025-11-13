const express = require('express');
const app = express();
const db = require("../backend/db/db");
const userRouter = require("./route/userRouters");
const agencyRouter = require("./route/agencyRoutes");
const tourRouter = require("./route/tourRoutes");
const cors = require('cors');

// -------------------------------
// CORS setup
app.use(cors({
    origin: "http://localhost:5173", //  frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"], // allowed HTTP methods
    credentials: true, // allow cookies
}));

// Parse JSON body
app.use(express.json());

// Connect to DB
db();
require('dotenv').config();

// -------------------------------
// Routes
app.use("/api/user", userRouter);
app.use("/api/agencies", agencyRouter);
app.use("/api/tours", tourRouter);

// -------------------------------
const port = 8080;
app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});
