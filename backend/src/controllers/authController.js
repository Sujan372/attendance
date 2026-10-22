const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================
// REGISTER USER
// ==========================
const registerUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Check required fields
        if (!username || !password || !role) {
            return res.status(400).json({
                message: "Username, password and role are required"
            });
        }

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                message: "Username already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            username,
            password: hashedPassword,
            role
            // isVerified defaults to false (if schema defines it)
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                isVerified: user.isVerified || false
            }
        });

    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

// ==========================
// LOGIN USER (with OTP check)
// ==========================
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check required fields
        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        // Find user
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        // 🔥 NEW: Check if account is verified via OTP
        if (!user.isVerified) {
            return res.status(403).json({
                message: "Account not verified. Please verify your OTP first.",
                action: "Request OTP using POST /api/auth/generate-otp with your username",
                next: "Then verify using POST /api/auth/verify-otp"
            });
        }

        // Check if account is active (optional – requires 'isActive' field in model)
        if (user.isActive === false) {
            return res.status(403).json({
                message: "Account is inactive. Please contact support."
            });
        }

        // Compare password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Send response
        res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};
const resetPassword = async (req, res) => {
    try {
        const { username, newPassword } = req.body;

        if (!username || !newPassword) {
            return res.status(400).json({
                message: "Username and new password are required"
            });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.isVerified = true;

        await user.save();

        res.status(200).json({
            message: "Password reset successfully"
        });

    } catch (error) {
        console.error("Reset password error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// ==========================
// EXPORT FUNCTIONS
// ==========================
module.exports = {
    registerUser,
    loginUser,
    resetPassword  
};