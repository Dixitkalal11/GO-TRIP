// Migration routes
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { addPaymentColumnsToBookings, populateOldBookingsPayment, addBookingIdColumn } = require("../controllers/migrationController");

// Add payment columns to bookings table
router.post("/add-payment-columns", auth, addPaymentColumnsToBookings);

// Populate payment data for old bookings
router.post("/populate-payments", auth, populateOldBookingsPayment);

// Add booking_id column to bookings table
router.post("/add-booking-id-column", auth, addBookingIdColumn);

module.exports = router;

