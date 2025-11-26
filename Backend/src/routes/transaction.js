const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getUserTransactions, createTransaction } = require("../controllers/transactionController");

// Get all transactions for user
router.get("/", auth, getUserTransactions);

// Create a new transaction
router.post("/", auth, createTransaction);

module.exports = router;









