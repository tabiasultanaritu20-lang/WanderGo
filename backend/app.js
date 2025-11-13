const express = require('express');
const app = express();
const db = require("../backend/db/db");
const userRouter = require("./route/userRouters");
const blogRouter = require("./route/blogRoutes");  
const cors = require('cors');

// -------------------------------
// CORS setup
app.use(cors({
    origin: "http://localhost:5173", // frontend URL
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
app.use("/api/blogs", blogRouter);  // <--- ADD THIS

// -------------------------------
const port = 8080;

app.listen(port, () => {
    console.log(`Listening on port ${port}!`);

 });