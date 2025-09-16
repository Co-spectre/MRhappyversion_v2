// Authentication Routes for MRhappy Platform
// Handles registration, login, password reset, email verification, and profile management

import express from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import AuthService from '../services/AuthService.js';

const router = express.Router();
const authService = new AuthService();

// Rate limiting utility function
const createUserRateLimit = (windowMs, max) => {
  return rateLimit({
    windowMs: windowMs,
    max: max,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Token verification middleware
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const verification = await authService.verifyAccessToken(token);
    
    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = verification.user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

// Optional authentication middleware (doesn't require auth but attaches user if available)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      req.user = null;
      return next();
    }

    const verification = await authService.verifyAccessToken(token);
    
    if (verification.valid) {
      req.user = verification.user;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// Rate limiting for sensitive operations
const strictRateLimit = createUserRateLimit(15 * 60 * 1000, 5); // 5 requests per 15 minutes
const normalRateLimit = createUserRateLimit(15 * 60 * 1000, 20); // 20 requests per 15 minutes

// ==========================================
// VALIDATION RULES
// ==========================================

const registrationValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .matches(/^[\+]?[\d\s\-\(\)]{10,20}$/)
    .withMessage('Please provide a valid phone number'),
  body('dataProcessingConsent')
    .isBoolean()
    .withMessage('Data processing consent must be a boolean value')
    .custom((value) => {
      if (value !== true) {
        throw new Error('Data processing consent is required');
      }
      return true;
    })
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const passwordResetValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

const newPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
}

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', 
  normalRateLimit,
  registrationValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password, name, phone, dataProcessingConsent } = req.body;

      const result = await authService.register({
        email,
        password,
        name,
        phone,
        dataProcessingConsent
      });

      res.status(201).json(result);

    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login',
  normalRateLimit,
  loginValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;

      const result = await authService.login(email, password, rememberMe);

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000 // 30 days or 7 days
      });

      res.json(result);

    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }
);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout',
  verifyToken,
  async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {
        await authService.logout(req.userId, refreshToken);
      }

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// @route   POST /api/auth/logout-all
// @desc    Logout from all devices
// @access  Private
router.post('/logout-all',
  verifyToken,
  async (req, res) => {
    try {
      await authService.logoutAllDevices(req.userId);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logged out from all devices successfully'
      });

    } catch (error) {
      console.error('Logout all error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public (requires refresh token)
router.post('/refresh',
  normalRateLimit,
  async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      const result = await authService.refreshAccessToken(refreshToken);

      res.json(result);

    } catch (error) {
      console.error('Token refresh error:', error);
      
      // Clear invalid refresh token
      res.clearCookie('refreshToken');
      
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }
);

// ==========================================
// EMAIL VERIFICATION ROUTES
// ==========================================

// @route   GET /api/auth/verify-email/:token
// @desc    Verify email address
// @access  Public
router.get('/verify-email/:token',
  async (req, res) => {
    try {
      const { token } = req.params;
      const result = await authService.verifyEmail(token);

      res.json(result);

    } catch (error) {
      console.error('Email verification error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// @route   POST /api/auth/resend-verification
// @desc    Resend email verification
// @access  Public
router.post('/resend-verification',
  strictRateLimit,
  body('email').isEmail().normalizeEmail(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email } = req.body;
      const result = await authService.resendVerificationEmail(email);

      res.json(result);

    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// ==========================================
// PASSWORD RESET ROUTES
// ==========================================

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password',
  strictRateLimit,
  passwordResetValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email } = req.body;
      const result = await authService.requestPasswordReset(email);

      res.json(result);

    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password',
  strictRateLimit,
  newPasswordValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { token, password } = req.body;
      const result = await authService.resetPassword(token, password);

      res.json(result);

    } catch (error) {
      console.error('Password reset error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// ==========================================
// PROFILE MANAGEMENT ROUTES
// ==========================================

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile',
  verifyToken,
  async (req, res) => {
    try {
      res.json({
        success: true,
        user: req.user
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  }
);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile',
  verifyToken,
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('phone').optional().matches(/^[\+]?[\d\s\-\(\)]{10,20}$/)
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, phone } = req.body;
      const result = await authService.updateProfile(req.userId, { name, phone });

      res.json(result);

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password',
  verifyToken,
  strictRateLimit,
  changePasswordValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.userId, currentPassword, newPassword);

      res.json(result);

    } catch (error) {
      console.error('Change password error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// ==========================================
// UTILITY ROUTES
// ==========================================

// @route   GET /api/auth/check
// @desc    Check if user is authenticated
// @access  Public/Private
router.get('/check',
  optionalAuth,
  async (req, res) => {
    res.json({
      success: true,
      isAuthenticated: !!req.user,
      user: req.user || null
    });
  }
);

export default router;
