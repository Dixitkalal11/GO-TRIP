// src/routes/booking.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { createBooking, verifyPayment, getUserBookings, createTestBooking, getUserMaxCoins, getAdminStats, getAdminRecentBookings, getAdminAllBookings, cancelBooking, sendTicketEmail, migrateOldBookingsPayment } = require("../controllers/bookingController");

router.post("/", auth, createBooking); // create booking + Razorpay order
router.post("/verify", auth, verifyPayment); // verify payment
router.post("/test-booking", auth, createTestBooking); // test booking creation for random payments
router.get("/", auth, getUserBookings); // list user bookings
router.get("/max-coins", auth, getUserMaxCoins); // get user's max coins allowed

// Send ticket email (manual test)
router.post("/:id/send-ticket", auth, sendTicketEmail);

// Cancel booking
router.post("/:id/cancel", auth, cancelBooking);

// Migration endpoint - add payment records for old bookings
router.post("/migrate-payments", auth, migrateOldBookingsPayment);

// Admin endpoints
router.get("/admin/stats", auth, getAdminStats); // get admin dashboard statistics
router.get("/admin/recent-bookings", auth, getAdminRecentBookings); // get recent bookings for admin
router.get("/admin/all-bookings", auth, getAdminAllBookings); // get all bookings for admin

module.exports = router;
