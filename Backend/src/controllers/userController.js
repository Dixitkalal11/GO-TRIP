const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Op } = require("sequelize");
const User = require("../models/user");
const PasswordReset = require("../models/passwordReset");
const { sendPasswordResetEmail, sendWelcomeEmail } = require("../utils/emailService");

const JWT_SECRET = process.env.JWT_SECRET || "mysecret";
const { sequelize } = require("../models");

// User Registration
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    const trimmedName = (name || '').toString().trim();
    const normalizedEmail = (email || '').toString().trim().toLowerCase();
    const rawPassword = (password || '').toString();

    if (!trimmedName || !normalizedEmail || !rawPassword) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    // Check if user already exists (case-insensitive)
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Adapt to legacy schemas requiring first_name/last_name, etc.
    let createData = { name: trimmedName, email: normalizedEmail, password: hashedPassword };
    try {
      const [cols] = await sequelize.query(
        `SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'`
      );
      const columnNames = (cols || []).map(c => c.COLUMN_NAME);
      const requiresFirst = columnNames.includes('first_name');
      const requiresLast = columnNames.includes('last_name');
      if (requiresFirst || requiresLast) {
        const parts = trimmedName.split(/\s+/);
        const firstName = parts[0] || trimmedName;
        const lastName = parts.slice(1).join(' ') || '';
        if (requiresFirst) createData.first_name = firstName;
        if (requiresLast) createData.last_name = lastName;
      }
    } catch (schemaErr) {
      console.warn('User register: schema inspect failed, proceeding with defaults:', schemaErr?.message);
    }

    const user = await User.create(createData);

    // Send welcome email (best-effort, do not block)
    sendWelcomeEmail(normalizedEmail, trimmedName).catch(err => 
      console.error('Failed to send welcome email:', err)
    );

    // Issue token for immediate login
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ 
      message: "User registered successfully", 
      token,
      user: { id: user.id, name: user.name, email: user.email, coins: user.coins }
    });
  } catch (err) {
    console.error('User register error:', err);
    // Handle common ORM errors cleanly
    if (err?.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'User already exists' });
    }
    if (err?.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors?.[0]?.message || 'Validation error' });
    }
    res.status(500).json({ error: 'Internal error during registration' });
  }
};

// User Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // If user has no password (Google login user), block password login
    if (!user.password) {
      return res.status(400).json({ error: 'Google user', message: 'This account was created with Google. Please use Google login.' });
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (hashErr) {
      // Handle legacy/plaintext or invalid hash format gracefully
      if (user.password === password) {
        // Upgrade to bcrypt on-the-fly
        const newHash = await bcrypt.hash(password, 10);
        await user.update({ password: newHash });
        isMatch = true;
      } else {
        console.warn('Login hash compare failed for user id', user.id, '-', hashErr?.message);
        isMatch = false;
      }
    }
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "24h" });

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error('User login error:', err);
    res.status(500).json({ error: 'Internal error during login' });
  }
};

// Get profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, { attributes: ['id','name','email','coins'] });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user coins
exports.getCoins = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, { attributes: ['coins'] });
    res.json({ coins: user?.coins || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user coins (for earning/spending)
exports.updateCoins = async (req, res) => {
  try {
    const userId = req.user.id;
    const { coins, operation = 'add' } = req.body; // operation: 'add' or 'subtract'
    
    if (typeof coins !== 'number' || coins < 0) {
      return res.status(400).json({ error: 'Invalid coins amount' });
    }
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    let newCoins;
    if (operation === 'add') {
      newCoins = user.coins + coins;
    } else if (operation === 'subtract') {
      if (user.coins < coins) {
        return res.status(400).json({ error: 'Insufficient coins' });
      }
      newCoins = user.coins - coins;
    } else {
      return res.status(400).json({ error: 'Invalid operation. Use "add" or "subtract"' });
    }
    
    await user.update({ coins: newCoins });
    
    res.json({ 
      message: `Coins ${operation === 'add' ? 'added' : 'deducted'} successfully`,
      coins: newCoins,
      operation,
      amount: coins
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Forgot Password - Check if user exists in MySQL
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Check if user exists in MySQL database
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found', 
        message: 'No account found with this email address. Please check your email or register for a new account.' 
      });
    }
    
    // Check if user has a password (not a Google-only user)
    if (!user.password) {
      return res.status(400).json({ 
        error: 'Google user', 
        message: 'This account was created with Google. Please use the "Login with Google" option or reset your password through Google.' 
      });
    }
    
    // User exists and has a password - generate reset token and send email
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    
    // Store reset token in database
    await PasswordReset.create({
      email,
      token: resetToken,
      expiresAt,
      used: false
    });
    
    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, resetToken);
    
    if (emailResult.success) {
      res.json({ 
        message: 'Password reset instructions have been sent to your email.',
        userType: 'normal' // Indicates this is a normal user, not Google user
      });
    } else {
      console.error('Failed to send password reset email:', emailResult.error);
      res.status(500).json({ 
        error: 'Failed to send password reset email. Please try again later.' 
      });
    }
    
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Reset Password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    
    // Find the reset token
    const resetRecord = await PasswordReset.findOne({
      where: { 
        token,
        used: false,
        expiresAt: {
          [Op.gt]: new Date() // Token not expired
        }
      }
    });
    
    if (!resetRecord) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user's password
    await User.update(
      { password: hashedPassword },
      { where: { email: resetRecord.email } }
    );
    
    // Mark token as used
    await resetRecord.update({ used: true });
    
    res.json({ 
      message: 'Password has been reset successfully. You can now login with your new password.' 
    });
    
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Google login
exports.googleLogin = async (req, res) => {
  try {
    const { userInfo } = req.body;
    const { uid, email, name, picture } = userInfo || {};
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required for Google login' });
    }
    
    // Check if user exists
    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Create new user for Google login
      user = await User.create({
        name,
        email,
        password: null, // No password for Google users
        coins: 0
      });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ 
      message: "Google login successful", 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        coins: user.coins 
      } 
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all users for admin dashboard
exports.getAllUsers = async (req, res) => {
  try {
    console.log('👥 Fetching all users for admin...');
    
    const users = await sequelize.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.coins,
        u.createdAt,
        COUNT(b.id) as totalBookings
      FROM users u
      LEFT JOIN bookings b ON u.id = b.userId AND b.status = 'confirmed'
      GROUP BY u.id, u.name, u.email, u.coins, u.createdAt
      ORDER BY u.createdAt DESC
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('✅ Users fetched for admin:', users.length);
    res.json(users);
  } catch (err) {
    console.error('❌ Error fetching users for admin:', err);
    res.status(500).json({ error: err.message });
  }
};
