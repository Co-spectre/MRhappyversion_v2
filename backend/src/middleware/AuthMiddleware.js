// Authentication Middleware for MRhappy Platform
// Handles JWT token verification, role-based access control, and route protection

const jwt = require('jsonwebtoken');
const { User } = require('../../database/mongodb-schema');
const AuthService = require('../services/AuthService');

class AuthMiddleware {
  constructor() {
    this.authService = new AuthService();
  }

  // ==========================================
  // JWT TOKEN VERIFICATION
  // ==========================================

  async verifyToken(req, res, next) {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Access token required'
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify token
      const verificationResult = await this.authService.verifyAccessToken(token);
      
      if (!verificationResult.success) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      // Attach user to request
      req.user = verificationResult.user;
      req.userId = verificationResult.userId;

      next();

    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Token verification failed'
      });
    }
  }

  // ==========================================
  // OPTIONAL AUTHENTICATION
  // ==========================================

  async optionalAuth(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        try {
          const verificationResult = await this.authService.verifyAccessToken(token);
          if (verificationResult.success) {
            req.user = verificationResult.user;
            req.userId = verificationResult.userId;
          }
        } catch (error) {
          // Ignore token errors for optional auth
          console.log('Optional auth token error:', error.message);
        }
      }

      next();

    } catch (error) {
      // Continue without authentication for optional routes
      next();
    }
  }

  // ==========================================
  // ROLE-BASED ACCESS CONTROL
  // ==========================================

  requireRole(allowedRoles) {
    return async (req, res, next) => {
      try {
        // Ensure user is authenticated first
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
        }

        // Check if user role is allowed
        const userRole = req.user.role;
        const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (!rolesArray.includes(userRole)) {
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions'
          });
        }

        next();

      } catch (error) {
        console.error('Role verification error:', error);
        return res.status(500).json({
          success: false,
          message: 'Role verification failed'
        });
      }
    };
  }

  // ==========================================
  // ADMIN ACCESS CONTROL
  // ==========================================

  requireAdmin() {
    return this.requireRole(['admin']);
  }

  requireAdminOrManager() {
    return this.requireRole(['admin', 'manager']);
  }

  requireDeliveryOrAbove() {
    return this.requireRole(['admin', 'manager', 'delivery']);
  }

  // ==========================================
  // ACCOUNT VERIFICATION CHECKS
  // ==========================================

  requireVerifiedEmail(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!req.user.isEmailVerified && process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          message: 'Email verification required',
          code: 'EMAIL_NOT_VERIFIED'
        });
      }

      next();

    } catch (error) {
      console.error('Email verification check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Verification check failed'
      });
    }
  }

  requireActiveAccount(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      next();

    } catch (error) {
      console.error('Account status check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Account status check failed'
      });
    }
  }

  // ==========================================
  // OWNERSHIP VERIFICATION
  // ==========================================

  requireOwnership(resourceField = 'userId') {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
          }

        // Skip ownership check for admins
        if (req.user.role === 'admin') {
          return next();
        }

        // Check if user owns the resource
        const resourceUserId = req.body[resourceField] || req.params[resourceField] || req.query[resourceField];
        
        if (resourceUserId && resourceUserId !== req.userId.toString()) {
          return res.status(403).json({
            success: false,
            message: 'You can only access your own resources'
          });
        }

        next();

      } catch (error) {
        console.error('Ownership verification error:', error);
        return res.status(500).json({
          success: false,
          message: 'Ownership verification failed'
        });
      }
    };
  }

  // ==========================================
  // RATE LIMITING BY USER
  // ==========================================

  createUserRateLimit(windowMs = 15 * 60 * 1000, maxRequests = 100) {
    const userRequests = new Map();

    return (req, res, next) => {
      try {
        const userId = req.userId || req.ip;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean old entries
        if (userRequests.has(userId)) {
          const userHistory = userRequests.get(userId);
          const validRequests = userHistory.filter(timestamp => timestamp > windowStart);
          userRequests.set(userId, validRequests);
        }

        // Check current request count
        const currentRequests = userRequests.get(userId) || [];
        
        if (currentRequests.length >= maxRequests) {
          return res.status(429).json({
            success: false,
            message: 'Too many requests, please try again later',
            retryAfter: Math.ceil(windowMs / 1000)
          });
        }

        // Add current request
        currentRequests.push(now);
        userRequests.set(userId, currentRequests);

        next();

      } catch (error) {
        console.error('Rate limiting error:', error);
        next(); // Continue on error
      }
    };
  }

  // ==========================================
  // MIDDLEWARE COMBINATIONS
  // ==========================================

  // Standard authentication for customer routes
  customerAuth() {
    return [
      this.verifyToken.bind(this),
      this.requireActiveAccount.bind(this)
    ];
  }

  // Full authentication with email verification
  fullAuth() {
    return [
      this.verifyToken.bind(this),
      this.requireActiveAccount.bind(this),
      this.requireVerifiedEmail.bind(this)
    ];
  }

  // Admin authentication
  adminAuth() {
    return [
      this.verifyToken.bind(this),
      this.requireActiveAccount.bind(this),
      this.requireAdmin()
    ];
  }

  // Manager or above authentication
  managerAuth() {
    return [
      this.verifyToken.bind(this),
      this.requireActiveAccount.bind(this),
      this.requireAdminOrManager()
    ];
  }
}

// Create singleton instance
const authMiddleware = new AuthMiddleware();

// Export individual middleware functions
module.exports = {
  // Instance for advanced usage
  authMiddleware,
  
  // Basic authentication
  verifyToken: authMiddleware.verifyToken.bind(authMiddleware),
  optionalAuth: authMiddleware.optionalAuth.bind(authMiddleware),
  
  // Role-based access
  requireRole: authMiddleware.requireRole.bind(authMiddleware),
  requireAdmin: authMiddleware.requireAdmin.bind(authMiddleware),
  requireAdminOrManager: authMiddleware.requireAdminOrManager.bind(authMiddleware),
  requireDeliveryOrAbove: authMiddleware.requireDeliveryOrAbove.bind(authMiddleware),
  
  // Account verification
  requireVerifiedEmail: authMiddleware.requireVerifiedEmail.bind(authMiddleware),
  requireActiveAccount: authMiddleware.requireActiveAccount.bind(authMiddleware),
  
  // Ownership and rate limiting
  requireOwnership: authMiddleware.requireOwnership.bind(authMiddleware),
  createUserRateLimit: authMiddleware.createUserRateLimit.bind(authMiddleware),
  
  // Middleware combinations
  customerAuth: authMiddleware.customerAuth.bind(authMiddleware),
  fullAuth: authMiddleware.fullAuth.bind(authMiddleware),
  adminAuth: authMiddleware.adminAuth.bind(authMiddleware),
  managerAuth: authMiddleware.managerAuth.bind(authMiddleware)
};
