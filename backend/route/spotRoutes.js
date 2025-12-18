const express = require('express');
const router = express.Router();
const c = require('../controller/spotController');

router.get('/', c.listSpots);
router.post('/', c.createSpot);
router.post('/seed', c.seedSpots);

module.exports = router;
