const express = require('express');
const router = express.Router();
const controller = require('../controller/emergencyController');

router.get('/safety-rating', controller.safetyRating);
router.get('/travel-advice', controller.travelAdvice);
router.post('/safety-rating/rate', controller.rateSafety);
router.put('/safety-rating/admin', controller.setAdminSafetyRating);
router.get('/alerts', controller.listAlerts);
router.post('/alerts', controller.createAlert);

module.exports = router;