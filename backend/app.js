//all require

const express = require('express');
const app = express();
const db=require("../backend/db/db")
const userRouter = require("./route/userRouters");
const cors = require('cors');

// -------------------------------

app.use(express.json());


db()

//---------------------------------

app.use("/api/user", userRouter);
// --------------------------------------

const port =  8080;


app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
})
