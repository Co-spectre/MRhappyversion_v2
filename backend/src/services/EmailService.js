// Email Service for MRhappy Platform
// Handles email verification, password reset, and notification emails

import nodemailer from 'nodemailer';
import path from 'path';

class EmailService {
  constructor() {
    this.emailProvider = process.env.EMAIL_PROVIDER || 'console';
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@mrhappy.com';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'MRhappy Restaurant';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (this.emailProvider === 'console' || process.env.NODE_ENV === 'development') {
      // Console logging for development
      this.transporter = {
        sendMail: (options) => {
          console.log('\n📧 EMAIL SENT (Development Mode)');
          console.log('To:', options.to);
          console.log('Subject:', options.subject);
          console.log('Content:', options.html || options.text);
          console.log('────────────────────────────────\n');
          return Promise.resolve({ messageId: 'dev-' + Date.now() });
        }
      };
    } else if (this.emailProvider === 'sendgrid') {
      // SendGrid configuration
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      this.transporter = {
        sendMail: async (options) => {
          const msg = {
            to: options.to,
            from: {
              email: this.fromEmail,
              name: this.fromName
            },
            subject: options.subject,
            html: options.html,
            text: options.text
          };
          return await sgMail.send(msg);
        }
      };
    } else {
      // SMTP configuration (Gmail, Outlook, etc.)
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  // ==========================================
  // EMAIL VERIFICATION
  // ==========================================

  async sendVerificationEmail(email, name, token) {
    try {
      const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;
      
      const subject = 'Verify Your MRhappy Account';
      const html = this.getVerificationEmailTemplate(name, verificationUrl);
      const text = `
        Hello ${name},
        
        Thank you for registering with MRhappy!
        
        Please verify your email address by clicking the link below:
        ${verificationUrl}
        
        This link will expire in 24 hours.
        
        If you didn't create an account with us, please ignore this email.
        
        Best regards,
        The MRhappy Team
      `;

      await this.transporter.sendMail({
        to: email,
        subject,
        html,
        text
      });

      console.log(`✅ Verification email sent to ${email}`);
      return true;

    } catch (error) {
      console.error('❌ Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  // ==========================================
  // PASSWORD RESET
  // ==========================================

  async sendPasswordResetEmail(email, name, token) {
    try {
      const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
      
      const subject = 'Reset Your MRhappy Password';
      const html = this.getPasswordResetEmailTemplate(name, resetUrl);
      const text = `
        Hello ${name},
        
        We received a request to reset your password for your MRhappy account.
        
        Please click the link below to reset your password:
        ${resetUrl}
        
        This link will expire in 10 minutes for security reasons.
        
        If you didn't request a password reset, please ignore this email.
        
        Best regards,
        The MRhappy Team
      `;

      await this.transporter.sendMail({
        to: email,
        subject,
        html,
        text
      });

      console.log(`✅ Password reset email sent to ${email}`);
      return true;

    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  // ==========================================
  // ORDER NOTIFICATIONS
  // ==========================================

  async sendOrderConfirmationEmail(email, name, orderDetails) {
    try {
      const subject = `Order Confirmation - ${orderDetails.orderNumber}`;
      const html = this.getOrderConfirmationTemplate(name, orderDetails);
      const text = `
        Hello ${name},
        
        Your order has been confirmed!
        
        Order Number: ${orderDetails.orderNumber}
        Total: €${orderDetails.total.toFixed(2)}
        
        We'll notify you when your order is ready.
        
        Best regards,
        The MRhappy Team
      `;

      await this.transporter.sendMail({
        to: email,
        subject,
        html,
        text
      });

      console.log(`✅ Order confirmation email sent to ${email}`);
      return true;

    } catch (error) {
      console.error('❌ Error sending order confirmation email:', error);
      throw new Error('Failed to send order confirmation email');
    }
  }

  // ==========================================
  // EMAIL TEMPLATES
  // ==========================================

  getVerificationEmailTemplate(name, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - MRhappy</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .button { 
              display: inline-block; 
              background: #dc2626; 
              color: white; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0; 
            }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to MRhappy! 🍕</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Thank you for joining MRhappy, Bremen's favorite restaurant delivery platform!</p>
              <p>To complete your registration and start ordering delicious food, please verify your email address:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p>This verification link will expire in 24 hours.</p>
              <p>If you didn't create an account with us, please ignore this email.</p>
              <p>Best regards,<br>The MRhappy Team</p>
            </div>
            <div class="footer">
              <p>MRhappy Restaurant Platform | Bremen, Germany</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getPasswordResetEmailTemplate(name, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password - MRhappy</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .button { 
              display: inline-block; 
              background: #dc2626; 
              color: white; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0; 
            }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request 🔒</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>We received a request to reset your password for your MRhappy account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <div class="warning">
                <strong>Security Notice:</strong>
                <ul>
                  <li>This link will expire in 10 minutes</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Your current password remains unchanged until you create a new one</li>
                </ul>
              </div>
              <p>If you continue to have issues, please contact our support team.</p>
              <p>Best regards,<br>The MRhappy Team</p>
            </div>
            <div class="footer">
              <p>MRhappy Restaurant Platform | Bremen, Germany</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getOrderConfirmationTemplate(name, orderDetails) {
    const itemsHtml = orderDetails.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">€${item.totalPrice.toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation - MRhappy</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .order-table th { background: #f3f4f6; padding: 10px; text-align: left; }
            .total-row { font-weight: bold; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmed! ✅</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Thank you for your order! We've received it and are preparing your delicious meal.</p>
              
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
              <p><strong>Order Type:</strong> ${orderDetails.orderType}</p>
              <p><strong>Estimated Time:</strong> ${orderDetails.estimatedTime || '30-45 minutes'}</p>
              
              <table class="order-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr class="total-row">
                    <td colspan="2" style="padding: 15px; text-align: right;">Total:</td>
                    <td style="padding: 15px; text-align: right;">€${orderDetails.total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              
              <p>We'll send you updates as your order progresses. You can also track your order in the app.</p>
              
              <p>Best regards,<br>The MRhappy Team</p>
            </div>
            <div class="footer">
              <p>MRhappy Restaurant Platform | Bremen, Germany</p>
              <p>Questions? Contact us at support@mrhappy.com</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  async testConnection() {
    try {
      if (this.emailProvider === 'console') {
        console.log('✅ Email service ready (Console mode)');
        return true;
      }

      // Test SMTP connection
      if (this.transporter.verify) {
        await this.transporter.verify();
        console.log('✅ Email service connected successfully');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

export default EmailService;
