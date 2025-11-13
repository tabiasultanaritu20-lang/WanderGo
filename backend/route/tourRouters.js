const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");

router.post("/:agencyId/tours", tourController.createTour);
router.get("/:agencyId/tours", tourController.getToursByAgency);
router.put("/:agencyId/tours/:tourId", tourController.updateTour);
router.delete("/:agencyId/tours/:tourId", tourController.deleteTour);

module.exports = router;
