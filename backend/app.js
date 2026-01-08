const express = require('express');
const app = express();
const db = require("../backend/db/db");
const userRouter = require("./route/userRouters");
const blogRouter = require("./route/blogRoutes");  
const tourRouter = require("./route/tourRouters");
const packageRouter = require("./route/packageRoutes");
const spotRouter = require("./route/spotRoutes");
const documentRouter = require("./route/documentRoutes");
const visaRouter = require("./route/visaRoutes");
const chatRouter = require("./route/chatRoutes");
const cors = require('cors');
require('dotenv').config();
const { ensureSeeded } = require('./controller/blogController');
const { ensureSeededEmergency } = require('./controller/emergencyController');

// -------------------------------
// CORS setup
app.use(cors());

// Parse JSON body
app.use(express.json());

// Connect to DB
db();

// Seed defaults (blogs, emergency contacts)
ensureSeeded();
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

// -------------------------------
const port = Number(process.env.PORT) || 8080;

app.get('/', (req, res) => {
    res.status(200).send('WanderGo backend is running. See /api/* for endpoints.');
});

app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});


// Safety & Emergency Hub routes
const emergencyRouter = require("./route/emergencyRoutes");
const safetyRouter = require("./route/safetyRoutes");
app.use('/api/emergency-contacts', emergencyRouter);
app.use('/api', safetyRouter);
