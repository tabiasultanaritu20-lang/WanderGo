const express = require('express');
const router = express.Router();
// const reviewRouter = require('./reviews'); // Import your review routes
// Import the controller functions
const {
    createTour,
    getAllTours,
    getTourById,
    updateTour,
    deleteTour,
    getMyTours
} = require('../controller/tour');


const {authMiddleware, Agency_And_Admin, adminOnly } = require('../middleware/authMiddleware');

// GET /api/tours
router.get('/', getAllTours);



// GET /api/tours/agency/my-tours

router.get('/agency/my-tours', authMiddleware, Agency_And_Admin, getMyTours);

// GET
router.get('/:id', getTourById);

// POST
router.post('/', authMiddleware, Agency_And_Admin, createTour);

// PATCH
router.put('/:id', authMiddleware, Agency_And_Admin, updateTour);


router.delete('/:id', authMiddleware, Agency_And_Admin, deleteTour);
// router.use('/:tourId/reviews', reviewRouter);

module.exports = router;