//all require

const express = require('express');
const app = express();
const cors = require('cors');

// -------------------------------

app.use(express.json());

//---------------------------------

app.get('/', (req, res) => {
    res.send('Welcome to the server');
})

// --------------------------------------

const port = process.env.PORT || 3000;


app.listen(port, () => {
    console.log('Listening on port 3000!');
})
