const express = require("express");
const router = express.Router();
const { 
  adminLogin, 
  getDashboardStats, 
  getRoutes, 
  createRoute, 
  updateRoute, 
  deleteRoute,
  getRecentBookings,
  getRouteSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getAllUsers,
  getAnalytics,
  getCoins,
  createCoin,
  updateCoin,
  deleteCoin,
  getCoinStats
} = require("../controllers/adminController");

// Admin authentication
router.post("/login", adminLogin);

// Dashboard stats
router.get("/stats", getDashboardStats);

// Routes CRUD
router.get("/routes", getRoutes);
router.post("/routes", createRoute);
router.put("/routes/:id", updateRoute);
router.delete("/routes/:id", deleteRoute);

// Recent bookings
router.get("/bookings", getRecentBookings);

// Users management
router.get("/users", getAllUsers);

// Analytics
router.get("/analytics", getAnalytics);

// Schedule Management (CRUD)
router.get("/routes/:routeId/schedules", getRouteSchedules);
router.post("/schedules", createSchedule);
router.put("/schedules/:id", updateSchedule);
router.delete("/schedules/:id", deleteSchedule);

// Coin Management (CRUD)
router.get("/coins", getCoins);
router.post("/coins", createCoin);
router.put("/coins/:id", updateCoin);
router.delete("/coins/:id", deleteCoin);
router.get("/coins/stats", getCoinStats);

module.exports = router;
