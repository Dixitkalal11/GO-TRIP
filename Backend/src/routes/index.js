const express = require("express");
const healthRoutes = require("./health");
const userRoutes = require("./user");
const testAuthRoutes = require("./testAuth");
const bookingRoutes = require("./booking");      // declare only once
const complaintRoutes = require("./complaint");
const paymentRoutes = require("./payment");
const transactionRoutes = require("./transaction");
const adminRoutes = require("./admin");
const enquiryRoutes = require("./enquiry");
const chatRoutes = require("./chat");
const migrationRoutes = require("./migration");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", userRoutes);  // Changed from /users to /auth
router.use("/test", testAuthRoutes);
router.use("/bookings", bookingRoutes);        // use only once
router.use("/complaints", complaintRoutes);
router.use("/payments", paymentRoutes);
router.use("/transactions", transactionRoutes);
router.use("/admin", adminRoutes);
router.use("/enquiries", enquiryRoutes);
router.use("/chat", chatRoutes);
router.use("/migration", migrationRoutes);

module.exports = router;
