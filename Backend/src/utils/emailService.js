const nodemailer = require('nodemailer');

// Email configuration - for development/testing without real email
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to other services like 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com', // Your email
    pass: process.env.EMAIL_PASS || 'your-app-password' // Your app password (not regular password)
  }
});

// Check if email is properly configured
const isEmailConfigured = process.env.EMAIL_USER && 
                         process.env.EMAIL_USER !== 'your-email@gmail.com' &&
                         process.env.EMAIL_PASS && 
                         process.env.EMAIL_PASS !== 'your-app-password';

console.log('📧 Email Configuration Status:');
console.log('   EMAIL_USER:', process.env.EMAIL_USER || 'Not set');
console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
console.log('   Configured:', isEmailConfigured ? '✅ Yes' : '❌ No');

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password?token=${resetToken}`;
    
    // For development - if email is not configured, just log the reset URL
    if (!isEmailConfigured) {
      console.log('📧 EMAIL NOT CONFIGURED - Password reset URL for', email, ':', resetUrl);
      return { success: true, messageId: 'dev-mode', resetUrl };
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'GoTrip - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
            <h1>GoTrip</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f8f9fa;">
            <h2 style="color: #333;">Password Reset Request</h2>
            
            <p>Hello,</p>
            
            <p>We received a request to reset your password for your GoTrip account. If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
            
            <p><strong>Important:</strong></p>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this password reset, please ignore this email</li>
              <li>Your password will not be changed until you click the link above</li>
            </ul>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <p>Best regards,<br>The GoTrip Team</p>
          </div>
          
          <div style="background-color: #6c757d; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>© 2024 GoTrip. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email after registration
const sendWelcomeEmail = async (email, name) => {
  try {
    // For development - if email is not configured, just log
    if (!isEmailConfigured) {
      console.log('📧 EMAIL NOT CONFIGURED - Welcome email for', name, '(', email, ')');
      return { success: true, messageId: 'dev-mode' };
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Welcome to GoTrip!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
            <h1>GoTrip</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f8f9fa;">
            <h2 style="color: #333;">Welcome to GoTrip, ${name}!</h2>
            
            <p>Thank you for registering with GoTrip. We're excited to have you on board!</p>
            
            <p>With GoTrip, you can:</p>
            <ul>
              <li>Book flights, trains, and buses</li>
              <li>Manage your bookings easily</li>
              <li>Earn coins with every booking</li>
              <li>Get the best travel deals</li>
            </ul>
            
            <p>Start exploring and book your next trip today!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:4200'}" 
                 style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Start Booking
              </a>
            </div>
            
            <p>If you have any questions, feel free to contact our support team.</p>
            
            <p>Happy travels!<br>The GoTrip Team</p>
          </div>
          
          <div style="background-color: #6c757d; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>© 2024 GoTrip. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail
};
