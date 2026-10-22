const User = require('../models/User');
const nodemailer = require('nodemailer');

// ==========================================
// GENERATE OTP (using username)
// ==========================================
const generateOTP = async (req, res) => {
    try {
        const { username } = req.body;  // ✅ using username

        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        const user = await User.findOne({ username });  // ✅ search by username
        if (!user) {
            return res.status(404).json({ message: 'User not found with this username' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Log OTP to console (since we don't have email)
        console.log(`📧 OTP for ${username}: ${otp}`);

        // Optionally try to send email if username is an email format (but we'll skip)
        await sendOTPNotification(username, otp);

        res.status(200).json({
            message: 'OTP sent successfully',
            otp: otp // Remove in production
        });

    } catch (error) {
        console.error('Generate OTP error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ==========================================
// VERIFY OTP
// ==========================================
const verifyOTP = async (req, res) => {
    try {
        const { username, otp } = req.body;  // ✅ using username

        if (!username || !otp) {
            return res.status(400).json({ 
                message: 'Username and OTP are required' 
            });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.otpExpires < new Date()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.status(200).json({
            message: 'OTP verified successfully! User is now verified.'
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ==========================================
// RESEND OTP
// ==========================================
const resendOTP = async (req, res) => {
    try {
        const { username } = req.body;  // ✅ using username

        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        console.log(`🔄 New OTP for ${username}: ${otp}`);
        await sendOTPNotification(username, otp);

        res.status(200).json({
            message: 'New OTP sent successfully',
            otp: otp
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ==========================================
// HELPER: Send OTP Notification (console only)
// ==========================================
const sendOTPNotification = async (username, otp) => {
    // Since we don't have email, we just log it.
    console.log(`✅ OTP for ${username} is ${otp}`);
    
    // If you later add an email field, you can use this function to send real emails.
    // For now, we skip sending.
};

// ==========================================
// EXPORT
// ==========================================
module.exports = {
    generateOTP,
    verifyOTP,
    resendOTP
};