const express = require('express');
const router = express.Router();
const { chat } = require('../controller/chatController');

router.post('/', chat);

module.exports = router;
