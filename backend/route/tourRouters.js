const express = require("express");
const router = express.Router();
const tourController = require("../controller/tourController");
const {authMiddleware, Agency_And_Admin}= require("../middleware/authMiddleware");

// Create tour for an agency
router.post("/:agencyId/tours", authMiddleware, Agency_And_Admin, tourController.createTour);

// Get a specific tour (needs tourId)
router.get("/:agencyId/tours/:id", authMiddleware, Agency_And_Admin, tourController.getTourById);

// Update a tour
router.put("/:agencyId/tours/:id", authMiddleware, Agency_And_Admin, tourController.updateTour);

// Delete a tour
router.delete("/:agencyId/tours/:id", authMiddleware, Agency_And_Admin, tourController.deleteTour);

module.exports = router;
