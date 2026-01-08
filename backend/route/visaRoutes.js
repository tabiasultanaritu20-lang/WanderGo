const express = require('express');
const router = express.Router();
const { checkVisa, getTravelBriefing, getTravelInfo } = require('../controller/visaController');

router.get('/check', checkVisa);
router.get('/briefing', getTravelBriefing);
router.get('/travel-info', getTravelInfo);

module.exports = router;
