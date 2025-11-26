const express = require("express");
const router = express.Router();
const { register, login, getProfile, getCoins, updateCoins, googleLogin, forgotPassword, resetPassword, getAllUsers } = require("../controllers/userController");
const auth = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/google-login", googleLogin);
router.get("/profile", auth, getProfile);
router.get("/coins", auth, getCoins);
router.put("/coins", auth, updateCoins);
router.get("/users", auth, getAllUsers); // Admin endpoint to get all users

module.exports = router;
