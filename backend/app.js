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

app.use("/users", userRouter);
// --------------------------------------

const port = process.env.PORT || 3000;


app.listen(port, () => {
    console.log('Listening on port 3000!');
})
