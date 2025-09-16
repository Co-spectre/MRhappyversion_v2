// Authentication Service for MRhappy Platform
// Handles user registration, login, JWT tokens, password reset, and email verification

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from '../../database/mongodb-schema.js';
import EmailService from './EmailService.js';

class AuthService {
  constructor() {
    this.jwtAccessSecret = process.env.JWT_ACCESS_SECRET || 'mrhappy-access-secret';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'mrhappy-refresh-secret';
    this.jwtAccessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    this.jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    this.emailService = new EmailService();
  }

  // ==========================================
  // USER REGISTRATION
  // ==========================================

  async register(userData) {
    try {
      const { email, password, name, phone, dataProcessingConsent } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Validate password strength
      this.validatePassword(password);

      // Create new user
      const user = new User({
        email: email.toLowerCase(),
        password, // Will be hashed by the pre-save middleware
        name,
        phone,
        dataProcessingConsent,
        role: 'customer'
      });

      // Generate email verification token
      const verificationToken = user.createEmailVerificationToken();
      
      // Save user to database
      await user.save();

      // Send verification email (in production)
      if (process.env.NODE_ENV === 'production') {
        await this.emailService.sendVerificationEmail(user.email, user.name, verificationToken);
      }

      // Generate JWT tokens
      const tokens = this.generateTokens(user._id);
      
      // Save refresh token to user
      await this.saveRefreshToken(user._id, tokens.refreshToken);

      // Return user data (without password) and tokens
      const userResponse = await User.findById(user._id).select('-password');
      
      return {
        success: true,
        message: 'User registered successfully',
        user: userResponse,
        tokens,
        emailVerificationRequired: !user.isEmailVerified
      };

    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  // ==========================================
  // USER LOGIN
  // ==========================================

  async login(email, password, rememberMe = false) {
    try {
      // Find user and include password for comparison
      const user = await User.findOne({ 
        email: email.toLowerCase(),
        isActive: true 
      }).select('+password');

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Check if email is verified (required for all environments)
      if (!user.isEmailVerified) {
        return {
          success: false,
          requiresEmailVerification: true,
          message: 'Please verify your email before logging in. Check your inbox for the verification link.',
          email: user.email
        };
      }

      // Generate JWT tokens
      const expiresIn = rememberMe ? '30d' : this.jwtRefreshExpiresIn;
      const tokens = this.generateTokens(user._id, { refreshExpiresIn: expiresIn });
      
      // Save refresh token
      await this.saveRefreshToken(user._id, tokens.refreshToken);

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Return user data (without password) and tokens
      const userResponse = await User.findById(user._id).select('-password');
      
      return {
        success: true,
        message: 'Login successful',
        user: userResponse,
        tokens
      };

    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // ==========================================
  // TOKEN MANAGEMENT
  // ==========================================

  generateTokens(userId, options = {}) {
    const accessToken = jwt.sign(
      { userId, type: 'access' },
      this.jwtAccessSecret,
      { expiresIn: options.accessExpiresIn || this.jwtAccessExpiresIn }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      this.jwtRefreshSecret,
      { expiresIn: options.refreshExpiresIn || this.jwtRefreshExpiresIn }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: options.accessExpiresIn || this.jwtAccessExpiresIn
    };
  }

  async saveRefreshToken(userId, refreshToken) {
    try {
      // Calculate expiration date
      const decoded = jwt.decode(refreshToken);
      const expiresAt = new Date(decoded.exp * 1000);

      // Add refresh token to user's refreshTokens array
      await User.findByIdAndUpdate(userId, {
        $push: {
          refreshTokens: {
            token: refreshToken,
            expiresAt
          }
        }
      });

      // Clean up expired tokens
      await this.cleanupExpiredTokens(userId);

    } catch (error) {
      console.error('Error saving refresh token:', error);
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret);
      
      // Find user and check if refresh token exists
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Check if refresh token exists in user's tokens
      const tokenExists = user.refreshTokens.some(
        tokenObj => tokenObj.token === refreshToken && tokenObj.expiresAt > new Date()
      );

      if (!tokenExists) {
        throw new Error('Invalid or expired refresh token');
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: user._id, type: 'access' },
        this.jwtAccessSecret,
        { expiresIn: this.jwtAccessExpiresIn }
      );

      return {
        success: true,
        accessToken,
        expiresIn: this.jwtAccessExpiresIn
      };

    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  async cleanupExpiredTokens(userId) {
    try {
      await User.findByIdAndUpdate(userId, {
        $pull: {
          refreshTokens: {
            expiresAt: { $lt: new Date() }
          }
        }
      });
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  async logout(userId, refreshToken) {
    try {
      // Remove specific refresh token
      await User.findByIdAndUpdate(userId, {
        $pull: {
          refreshTokens: { token: refreshToken }
        }
      });

      return {
        success: true,
        message: 'Logged out successfully'
      };

    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  async logoutAllDevices(userId) {
    try {
      // Remove all refresh tokens
      await User.findByIdAndUpdate(userId, {
        $set: { refreshTokens: [] }
      });

      return {
        success: true,
        message: 'Logged out from all devices successfully'
      };

    } catch (error) {
      throw new Error(`Logout all failed: ${error.message}`);
    }
  }

  // ==========================================
  // EMAIL VERIFICATION
  // ==========================================

  async verifyEmail(token) {
    try {
      const user = await User.findOne({
        emailVerificationToken: token,
        isEmailVerified: false
      });

      if (!user) {
        throw new Error('Invalid or expired verification token');
      }

      // Mark email as verified
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save();

      return {
        success: true,
        message: 'Email verified successfully'
      };

    } catch (error) {
      throw new Error(`Email verification failed: ${error.message}`);
    }
  }

  async resendVerificationEmail(email) {
    try {
      const user = await User.findOne({ 
        email: email.toLowerCase(),
        isEmailVerified: false 
      });

      if (!user) {
        throw new Error('User not found or email already verified');
      }

      // Generate new verification token
      const verificationToken = user.createEmailVerificationToken();
      await user.save();

      // Send verification email
      await this.emailService.sendVerificationEmail(user.email, user.name, verificationToken);

      return {
        success: true,
        message: 'Verification email sent successfully'
      };

    } catch (error) {
      throw new Error(`Resend verification failed: ${error.message}`);
    }
  }

  // ==========================================
  // PASSWORD RESET
  // ==========================================

  async requestPasswordReset(email) {
    try {
      const user = await User.findOne({ 
        email: email.toLowerCase(),
        isActive: true 
      });

      if (!user) {
        // Don't reveal if user exists or not for security
        return {
          success: true,
          message: 'If your email is registered, you will receive a password reset link'
        };
      }

      // Generate password reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      // Send password reset email
      await this.emailService.sendPasswordResetEmail(user.email, user.name, resetToken);

      return {
        success: true,
        message: 'Password reset email sent successfully'
      };

    } catch (error) {
      throw new Error(`Password reset request failed: ${error.message}`);
    }
  }

  async resetPassword(token, newPassword) {
    try {
      // Find user with valid reset token
      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() },
        isActive: true
      });

      if (!user) {
        throw new Error('Invalid or expired password reset token');
      }

      // Validate new password
      this.validatePassword(newPassword);

      // Update password
      user.password = newPassword; // Will be hashed by pre-save middleware
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      
      // Invalidate all existing refresh tokens for security
      user.refreshTokens = [];
      
      await user.save();

      return {
        success: true,
        message: 'Password reset successfully'
      };

    } catch (error) {
      throw new Error(`Password reset failed: ${error.message}`);
    }
  }

  // ==========================================
  // PASSWORD VALIDATION
  // ==========================================

  validatePassword(password) {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }

    return true;
  }

  // ==========================================
  // TOKEN VERIFICATION
  // ==========================================

  async verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtAccessSecret);
      
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      // Check if user still exists and is active
      const user = await User.findById(decoded.userId).select('-password');
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return {
        valid: true,
        success: true,
        user,
        userId: decoded.userId
      };

    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  // ==========================================
  // USER PROFILE MANAGEMENT
  // ==========================================

  async updateProfile(userId, updateData) {
    try {
      const allowedUpdates = ['name', 'phone'];
      const updates = {};

      // Filter allowed updates
      Object.keys(updateData).forEach(key => {
        if (allowedUpdates.includes(key)) {
          updates[key] = updateData[key];
        }
      });

      // Update user
      const user = await User.findByIdAndUpdate(
        userId,
        updates,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        message: 'Profile updated successfully',
        user
      };

    } catch (error) {
      throw new Error(`Profile update failed: ${error.message}`);
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Find user with password
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Validate new password
      this.validatePassword(newPassword);

      // Update password
      user.password = newPassword; // Will be hashed by pre-save middleware
      
      // Invalidate all refresh tokens except current session
      user.refreshTokens = [];
      
      await user.save();

      return {
        success: true,
        message: 'Password changed successfully'
      };

    } catch (error) {
      throw new Error(`Password change failed: ${error.message}`);
    }
  }
}

export default AuthService;
