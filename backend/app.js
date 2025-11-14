const express = require('express');
const app = express();
const db = require("../backend/db/db");
const userRouter = require("./route/userRouters");
const cors = require('cors');

// -------------------------------
// CORS setup
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

// Parse JSON body
app.use(express.json());

// Connect to DB
db();
require('dotenv').config();

// -------------------------------
// Routes
app.use("/api/user", userRouter);

// -------------------------------
const port = 8080;
app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});


// Safety & Emergency Hub routes
const emergencyRouter = require("./route/emergencyRoutes");
const safetyRouter = require("./route/safetyRoutes");
app.use('/api/emergency-contacts', emergencyRouter);
app.use('/api', safetyRouter);
