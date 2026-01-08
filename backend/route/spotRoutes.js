const express = require('express');
const router = express.Router();
const c = require('../controller/spotController');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/', c.listSpots);
router.post('/', authMiddleware, adminOnly, upload.array('photos', 5), c.createSpot);
router.delete('/:id', authMiddleware, adminOnly, c.deleteSpot);
router.post('/seed', authMiddleware, adminOnly, c.seedSpots);

module.exports = router;
