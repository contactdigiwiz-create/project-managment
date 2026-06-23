const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper to generate JWT token with safety check
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from server environment variables.");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body || {};

    // 1. Validation check for missing fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please fill in all required fields (name, email, password)" 
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        currentStatus: user.currentStatus,
      },
    });
  } catch (err) {
    next(err); // Hands over to global errorHandler middleware
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    // 1. Defend against empty payload/missing parameters
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide both an email and a password" 
      });
    }

    // 2. Fetch user from DB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // 3. Safe password matching check (won't run or crash if user is null)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        currentStatus: user.currentStatus,
      },
    });
  } catch (err) {
    next(err); // Hands over to global errorHandler middleware
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Not authorized, user data unavailable" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        currentStatus: user.currentStatus,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
