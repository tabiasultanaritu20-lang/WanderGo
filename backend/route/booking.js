const express = require('express');
const router = express.Router();

// 1. Verify this path matches your folder structure!
// If your file is in backend/controller/booking/booking.js, this is correct:
const bookingController = require('../controller/booking/booking');
const {  authMiddleware, Agency_And_Admin, adminOnly } = require('../middleware/authMiddleware'); // Adjust path to your auth middleware

// --- PUBLIC / USER ROUTES ---

// Create a checkout session (Booking step 1)
router.post('/checkout-session', bookingController.getCheckoutSession);

// Initialize booking (Called usually via webhook or success page, depending on your flow)
router.post('/', authMiddleware, bookingController.createBooking);

// Get my own bookings
router.get('/my-bookings', authMiddleware, bookingController.getMyBookings);

// Verify payment (Sandbox testing)
router.post('/verify-payment', authMiddleware, bookingController.verifyPayment);


// --- SPECIFIC BOOKING OPERATIONS ---

// Get single booking details
router.get('/:id', authMiddleware, bookingController.getBooking);

// Cancel a booking
router.put('/:id/cancel', authMiddleware, bookingController.cancelBooking);


// --- ADMIN ROUTES ---

// Get ALL bookings (Admin only)
router.get('/', authMiddleware, adminOnly, bookingController.getAllBookings);


module.exports = router;