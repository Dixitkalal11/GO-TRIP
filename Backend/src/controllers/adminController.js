const { sequelize } = require("../models");

// Admin authentication
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔐 Admin login attempt:', { username, password: '***' });

    // Check if username is 'admin' and password is valid
    const validPasswords = ['frankstein', 'mahek', 'hiren', 'dixit', 'hitendra'];
    
    if (username.toLowerCase() === 'admin' && validPasswords.includes(password.toLowerCase())) {
      console.log('✅ Admin login successful');
      res.json({ 
        success: true, 
        message: 'Admin login successful',
        admin: { username: 'admin', name: 'Administrator', role: 'admin' }
      });
    } else {
      console.log('❌ Admin login failed');
      res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }
  } catch (err) {
    console.error('❌ Admin login error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats...');

    // Get total users
    const userCount = await sequelize.query('SELECT COUNT(*) as count FROM users', {
      type: sequelize.QueryTypes.SELECT
    });

    // Get total bookings
    const bookingCount = await sequelize.query('SELECT COUNT(*) as count FROM bookings', {
      type: sequelize.QueryTypes.SELECT
    });

    // Get total revenue
    const revenueResult = await sequelize.query('SELECT SUM(price) as total FROM bookings WHERE status = "confirmed"', {
      type: sequelize.QueryTypes.SELECT
    });

    // Get total coins
    const coinsResult = await sequelize.query('SELECT SUM(coins) as total FROM users', {
      type: sequelize.QueryTypes.SELECT
    });

    // Get monthly revenue
    const monthlyRevenue = await sequelize.query(`
      SELECT SUM(price) as total 
      FROM bookings 
      WHERE status = "confirmed" 
      AND MONTH(createdAt) = MONTH(CURRENT_DATE()) 
      AND YEAR(createdAt) = YEAR(CURRENT_DATE())
    `, { type: sequelize.QueryTypes.SELECT });

    // Get quarterly revenue
    const quarterlyRevenue = await sequelize.query(`
      SELECT SUM(price) as total 
      FROM bookings 
      WHERE status = "confirmed" 
      AND QUARTER(createdAt) = QUARTER(CURRENT_DATE()) 
      AND YEAR(createdAt) = YEAR(CURRENT_DATE())
    `, { type: sequelize.QueryTypes.SELECT });

    // Get yearly revenue
    const yearlyRevenue = await sequelize.query(`
      SELECT SUM(price) as total 
      FROM bookings 
      WHERE status = "confirmed" 
      AND YEAR(createdAt) = YEAR(CURRENT_DATE())
    `, { type: sequelize.QueryTypes.SELECT });

    // Get monthly loss (failed bookings)
    const monthlyLoss = await sequelize.query(`
      SELECT SUM(price) as total 
      FROM bookings 
      WHERE status = "failed" 
      AND MONTH(createdAt) = MONTH(CURRENT_DATE()) 
      AND YEAR(createdAt) = YEAR(CURRENT_DATE())
    `, { type: sequelize.QueryTypes.SELECT });

    // Get quarterly loss
    const quarterlyLoss = await sequelize.query(`
      SELECT SUM(price) as total 
      FROM bookings 
      WHERE status = "failed" 
      AND QUARTER(createdAt) = QUARTER(CURRENT_DATE()) 
      AND YEAR(createdAt) = YEAR(CURRENT_DATE())
    `, { type: sequelize.QueryTypes.SELECT });

    // Get yearly loss
    const yearlyLoss = await sequelize.query(`
      SELECT SUM(price) as total 
      FROM bookings 
      WHERE status = "failed" 
      AND YEAR(createdAt) = YEAR(CURRENT_DATE())
    `, { type: sequelize.QueryTypes.SELECT });

    const stats = {
      totalUsers: userCount[0].count || 0,
      totalBookings: bookingCount[0].count || 0,
      totalRevenue: revenueResult[0].total || 0,
      totalCoins: coinsResult[0].total || 0,
      monthlyRevenue: monthlyRevenue[0].total || 0,
      quarterlyRevenue: quarterlyRevenue[0].total || 0,
      yearlyRevenue: yearlyRevenue[0].total || 0,
      monthlyLoss: monthlyLoss[0].total || 0,
      quarterlyLoss: quarterlyLoss[0].total || 0,
      yearlyLoss: yearlyLoss[0].total || 0
    };

    console.log('📊 Dashboard stats:', stats);
    res.json({ stats });
  } catch (err) {
    console.error('❌ Error fetching dashboard stats:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all routes
exports.getRoutes = async (req, res) => {
  try {
    console.log('🛣️ Fetching all routes...');
    
    const routes = await sequelize.query(`
      SELECT * FROM routes ORDER BY createdAt DESC
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('🛣️ Found routes:', routes.length);
    res.json({ routes });
  } catch (err) {
    console.error('❌ Error fetching routes:', err);
    res.status(500).json({ error: err.message });
  }
};

// Create new route
exports.createRoute = async (req, res) => {
  try {
    const { fromCity, toCity, travelMode, operator, price, duration, departureTime, arrivalTime, isActive } = req.body;
    
    console.log('➕ Creating new route:', { fromCity, toCity, travelMode, operator, price });

    const now = new Date();
    const result = await sequelize.query(`
      INSERT INTO routes (fromCity, toCity, travelMode, operator, price, duration, departureTime, arrivalTime, isActive, createdAt, updatedAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, {
      replacements: [fromCity, toCity, travelMode, operator, price, duration, departureTime, arrivalTime, isActive || 1, now, now],
      type: sequelize.QueryTypes.INSERT
    });

    console.log('✅ Route created with ID:', result[0]);
    res.json({ 
      success: true, 
      message: 'Route created successfully',
      routeId: result[0]
    });
  } catch (err) {
    console.error('❌ Error creating route:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update route
exports.updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { fromCity, toCity, travelMode, operator, price, duration, departureTime, arrivalTime, isActive } = req.body;
    
    console.log('✏️ Updating route:', id);

    const now = new Date();
    await sequelize.query(`
      UPDATE routes 
      SET fromCity = ?, toCity = ?, travelMode = ?, operator = ?, price = ?, 
          duration = ?, departureTime = ?, arrivalTime = ?, isActive = ?, updatedAt = ?
      WHERE id = ?
    `, {
      replacements: [fromCity, toCity, travelMode, operator, price, duration, departureTime, arrivalTime, isActive, now, id],
      type: sequelize.QueryTypes.UPDATE
    });

    console.log('✅ Route updated successfully');
    res.json({ 
      success: true, 
      message: 'Route updated successfully'
    });
  } catch (err) {
    console.error('❌ Error updating route:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete route
exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Deleting route:', id);

    await sequelize.query('DELETE FROM routes WHERE id = ?', {
      replacements: [id],
      type: sequelize.QueryTypes.DELETE
    });

    console.log('✅ Route deleted successfully');
    res.json({ 
      success: true, 
      message: 'Route deleted successfully'
    });
  } catch (err) {
    console.error('❌ Error deleting route:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get recent bookings
exports.getRecentBookings = async (req, res) => {
  try {
    console.log('📋 Fetching recent bookings...');
    
    const bookings = await sequelize.query(`
      SELECT 
        b.*,
        u.name as userName,
        u.email as userEmail
      FROM bookings b
      LEFT JOIN users u ON b.userId = u.id
      ORDER BY b.createdAt DESC
      LIMIT 20
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('📋 Found recent bookings:', bookings.length);
    res.json({ bookings });
  } catch (err) {
    console.error('❌ Error fetching recent bookings:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all schedules for a route
exports.getRouteSchedules = async (req, res) => {
  try {
    const { routeId } = req.params;
    console.log('📅 Fetching schedules for route:', routeId);

    const schedules = await sequelize.query(`
      SELECT * FROM schedules 
      WHERE routeId = ? 
      ORDER BY departureTime
    `, {
      replacements: [routeId],
      type: sequelize.QueryTypes.SELECT
    });

    console.log('✅ Schedules fetched:', schedules.length);
    res.json({ schedules });
  } catch (err) {
    console.error('❌ Error fetching schedules:', err);
    res.status(500).json({ error: err.message });
  }
};

// Create a new schedule
exports.createSchedule = async (req, res) => {
  try {
    const { routeId, departureTime, arrivalTime, availableSeats, price } = req.body;
    console.log('📅 Creating schedule for route:', routeId);

    await sequelize.query(`
      INSERT INTO schedules (routeId, departureTime, arrivalTime, availableSeats, price, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `, {
      replacements: [routeId, departureTime, arrivalTime, availableSeats, price],
      type: sequelize.QueryTypes.INSERT
    });

    console.log('✅ Schedule created successfully');
    res.json({ message: 'Schedule created successfully' });
  } catch (err) {
    console.error('❌ Error creating schedule:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update a schedule
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { departureTime, arrivalTime, availableSeats, price } = req.body;
    console.log('📅 Updating schedule:', id);

    await sequelize.query(`
      UPDATE schedules 
      SET departureTime = ?, arrivalTime = ?, availableSeats = ?, price = ?, updatedAt = NOW()
      WHERE id = ?
    `, {
      replacements: [departureTime, arrivalTime, availableSeats, price, id],
      type: sequelize.QueryTypes.UPDATE
    });

    console.log('✅ Schedule updated successfully');
    res.json({ message: 'Schedule updated successfully' });
  } catch (err) {
    console.error('❌ Error updating schedule:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete a schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting schedule:', id);

    await sequelize.query('DELETE FROM schedules WHERE id = ?', {
      replacements: [id],
      type: sequelize.QueryTypes.DELETE
    });

    console.log('✅ Schedule deleted successfully');
    res.json({ message: 'Schedule deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting schedule:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    console.log('👥 Fetching all users...');
    
    const users = await sequelize.query(`
      SELECT 
        id,
        name,
        email,
        coins,
        createdAt,
        updatedAt
      FROM users 
      ORDER BY createdAt DESC
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('👥 Found users:', users.length);
    res.json({ users });
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    console.log('📊 Fetching analytics data...');

    // Revenue trends (last 12 months)
    const revenueTrends = await sequelize.query(`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        SUM(price) as revenue,
        COUNT(*) as bookings
      FROM bookings 
      WHERE status = 'confirmed' 
        AND createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month ASC
    `, { type: sequelize.QueryTypes.SELECT });

    // Booking trends by travel mode
    const bookingByMode = await sequelize.query(`
      SELECT 
        travelMode,
        COUNT(*) as count,
        SUM(price) as revenue
      FROM bookings 
      WHERE status = 'confirmed'
      GROUP BY travelMode
      ORDER BY count DESC
    `, { type: sequelize.QueryTypes.SELECT });

    // Top routes
    const topRoutes = await sequelize.query(`
      SELECT 
        CONCAT(fromCity, ' → ', toCity) as route,
        COUNT(*) as bookings,
        SUM(price) as revenue,
        AVG(price) as avgPrice
      FROM bookings 
      WHERE status = 'confirmed'
      GROUP BY fromCity, toCity
      ORDER BY bookings DESC
      LIMIT 10
    `, { type: sequelize.QueryTypes.SELECT });

    // User registration trends (last 12 months)
    const userTrends = await sequelize.query(`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COUNT(*) as newUsers
      FROM users 
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month ASC
    `, { type: sequelize.QueryTypes.SELECT });

    // Daily booking trends (last 30 days)
    const dailyBookings = await sequelize.query(`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as bookings,
        SUM(price) as revenue
      FROM bookings 
      WHERE status = 'confirmed' 
        AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `, { type: sequelize.QueryTypes.SELECT });

    // Booking status distribution
    const bookingStatus = await sequelize.query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(price) as revenue
      FROM bookings 
      GROUP BY status
    `, { type: sequelize.QueryTypes.SELECT });

    // Peak hours analysis
    const peakHours = await sequelize.query(`
      SELECT 
        HOUR(createdAt) as hour,
        COUNT(*) as bookings
      FROM bookings 
      WHERE status = 'confirmed'
      GROUP BY HOUR(createdAt)
      ORDER BY hour ASC
    `, { type: sequelize.QueryTypes.SELECT });

    const analytics = {
      revenueTrends,
      bookingByMode,
      topRoutes,
      userTrends,
      dailyBookings,
      bookingStatus,
      peakHours
    };

    console.log('📊 Analytics data fetched successfully');
    res.json({ analytics });
  } catch (err) {
    console.error('❌ Error fetching analytics:', err);
    res.status(500).json({ error: err.message });
  }
};

// ==================== COIN MANAGEMENT ====================

// Get all coin packages
exports.getCoins = async (req, res) => {
  try {
    console.log('🪙 Fetching all coin packages...');
    
    const coins = await sequelize.query(`
      SELECT * FROM coin_packages ORDER BY createdAt DESC
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('🪙 Found coin packages:', coins.length);
    res.json({ coins });
  } catch (err) {
    console.error('❌ Error fetching coin packages:', err);
    res.status(500).json({ error: err.message });
  }
};

// Create new coin package
exports.createCoin = async (req, res) => {
  try {
    const { name, amount, price, type, discount, description, isActive, isPopular } = req.body;
    
    console.log('➕ Creating new coin package:', { name, amount, price, type, discount });

    const now = new Date();
    const result = await sequelize.query(`
      INSERT INTO coin_packages (name, amount, price, type, discount, description, isActive, isPopular, sales, createdAt, updatedAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `, {
      replacements: [name, amount, price, type, discount || 0, description || '', isActive || 1, isPopular || 0, now, now],
      type: sequelize.QueryTypes.INSERT
    });

    console.log('✅ Coin package created with ID:', result[0]);
    res.json({ 
      success: true, 
      message: 'Coin package created successfully',
      coinId: result[0]
    });
  } catch (err) {
    console.error('❌ Error creating coin package:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update coin package
exports.updateCoin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, price, type, discount, description, isActive, isPopular } = req.body;
    
    console.log('✏️ Updating coin package:', id);

    const now = new Date();
    await sequelize.query(`
      UPDATE coin_packages 
      SET name = ?, amount = ?, price = ?, type = ?, discount = ?, 
          description = ?, isActive = ?, isPopular = ?, updatedAt = ?
      WHERE id = ?
    `, {
      replacements: [name, amount, price, type, discount, description, isActive, isPopular, now, id],
      type: sequelize.QueryTypes.UPDATE
    });

    console.log('✅ Coin package updated successfully');
    res.json({ 
      success: true, 
      message: 'Coin package updated successfully'
    });
  } catch (err) {
    console.error('❌ Error updating coin package:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete coin package
exports.deleteCoin = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Deleting coin package:', id);

    await sequelize.query('DELETE FROM coin_packages WHERE id = ?', {
      replacements: [id],
      type: sequelize.QueryTypes.DELETE
    });

    console.log('✅ Coin package deleted successfully');
    res.json({ 
      success: true, 
      message: 'Coin package deleted successfully'
    });
  } catch (err) {
    console.error('❌ Error deleting coin package:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get coin package statistics
exports.getCoinStats = async (req, res) => {
  try {
    console.log('📊 Fetching comprehensive coin statistics...');

    // Total coins in circulation
    const totalCoinsResult = await sequelize.query(`
      SELECT SUM(amount * sales) as totalCoins 
      FROM coin_packages 
      WHERE isActive = 1
    `, { type: sequelize.QueryTypes.SELECT });

    // Total revenue from coin sales
    const totalRevenueResult = await sequelize.query(`
      SELECT SUM((price * (1 - discount/100)) * sales) as totalRevenue 
      FROM coin_packages 
      WHERE isActive = 1
    `, { type: sequelize.QueryTypes.SELECT });

    // Total active users (coin purchasers)
    const activeUsersResult = await sequelize.query(`
      SELECT SUM(sales) as activeUsers 
      FROM coin_packages 
      WHERE isActive = 1
    `, { type: sequelize.QueryTypes.SELECT });

    // Average purchase amount
    const avgPurchaseResult = await sequelize.query(`
      SELECT AVG(price * (1 - discount/100)) as avgPurchase 
      FROM coin_packages 
      WHERE isActive = 1 AND sales > 0
    `, { type: sequelize.QueryTypes.SELECT });

    // Coins distributed to users (from users table)
    const distributedCoinsResult = await sequelize.query(`
      SELECT SUM(coins) as distributedCoins 
      FROM users
    `, { type: sequelize.QueryTypes.SELECT });

    // Coins used/spent (estimated from bookings)
    const usedCoinsResult = await sequelize.query(`
      SELECT SUM(price) as usedCoins 
      FROM bookings 
      WHERE status = 'confirmed'
    `, { type: sequelize.QueryTypes.SELECT });

    // Coins lost (failed bookings)
    const lostCoinsResult = await sequelize.query(`
      SELECT SUM(price) as lostCoins 
      FROM bookings 
      WHERE status = 'failed'
    `, { type: sequelize.QueryTypes.SELECT });

    // Coins pending (pending bookings)
    const pendingCoinsResult = await sequelize.query(`
      SELECT SUM(price) as pendingCoins 
      FROM bookings 
      WHERE status = 'pending'
    `, { type: sequelize.QueryTypes.SELECT });

    // Package distribution by type
    const packageDistribution = await sequelize.query(`
      SELECT 
        type,
        COUNT(*) as packageCount,
        SUM(amount * sales) as totalCoins,
        SUM(sales) as totalSales,
        AVG(price * (1 - discount/100)) as avgPrice
      FROM coin_packages 
      WHERE isActive = 1
      GROUP BY type
      ORDER BY totalSales DESC
    `, { type: sequelize.QueryTypes.SELECT });

    // Monthly coin sales trend
    const monthlyTrend = await sequelize.query(`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        SUM(amount * sales) as coinsSold,
        SUM((price * (1 - discount/100)) * sales) as revenue,
        SUM(sales) as packagesSold
      FROM coin_packages 
      WHERE isActive = 1 AND createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month ASC
    `, { type: sequelize.QueryTypes.SELECT });

    // Top performing packages
    const topPackages = await sequelize.query(`
      SELECT 
        name,
        amount,
        price,
        type,
        discount,
        sales,
        (amount * sales) as totalCoinsSold,
        ((price * (1 - discount/100)) * sales) as totalRevenue
      FROM coin_packages 
      WHERE isActive = 1
      ORDER BY sales DESC
      LIMIT 5
    `, { type: sequelize.QueryTypes.SELECT });

    // Calculate efficiency metrics
    const totalCoinsSold = totalCoinsResult[0].totalCoins || 0;
    const distributedCoins = distributedCoinsResult[0].distributedCoins || 0;
    const usedCoins = usedCoinsResult[0].usedCoins || 0;
    const lostCoins = lostCoinsResult[0].lostCoins || 0;
    const pendingCoins = pendingCoinsResult[0].pendingCoins || 0;

    const stats = {
      // Basic metrics
      totalCoinsInCirculation: totalCoinsSold,
      totalRevenue: totalRevenueResult[0].totalRevenue || 0,
      activeUsers: activeUsersResult[0].activeUsers || 0,
      averagePurchase: avgPurchaseResult[0].avgPurchase || 0,
      
      // Distribution metrics
      distributedCoins: distributedCoins,
      usedCoins: usedCoins,
      lostCoins: lostCoins,
      pendingCoins: pendingCoins,
      availableCoins: distributedCoins - usedCoins - lostCoins,
      
      // Efficiency metrics
      coinUtilizationRate: distributedCoins > 0 ? (usedCoins / distributedCoins * 100) : 0,
      coinLossRate: distributedCoins > 0 ? (lostCoins / distributedCoins * 100) : 0,
      coinPendingRate: distributedCoins > 0 ? (pendingCoins / distributedCoins * 100) : 0,
      
      // Distribution data
      packageDistribution: packageDistribution,
      monthlyTrend: monthlyTrend,
      topPackages: topPackages
    };

    console.log('📊 Comprehensive coin statistics:', stats);
    res.json({ stats });
  } catch (err) {
    console.error('❌ Error fetching coin statistics:', err);
    res.status(500).json({ error: err.message });
  }
};
