const express = require("express");
const router = express.Router();
const complaintCtrl = require("../controllers/complaintController");
const auth = require("../middleware/auth");

// Protected routes
router.post("/", auth, complaintCtrl.createComplaint);
router.get("/my", auth, complaintCtrl.getUserComplaints);

// Admin route (no auth check for simplicity now)
router.get("/all", complaintCtrl.getAllComplaints);

module.exports = router;
