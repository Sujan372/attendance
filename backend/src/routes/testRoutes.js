const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
    authorizeRoles }
    = require("../middleware/roleMiddleware");

const router = express.Router();

// Any logged-in user
router.get("/protected", protect, (req, res) => {
    res.json({
        message: "You accessed a protected route",
        user: req.user
    });
});

// Admin only
router.get(
    "/admin",
    protect,
    authorizeRoles("admin"),
    (req, res) => {
        res.json({
            message: "Welcome Admin! You have admin access.",
            user: req.user
        });
    }
);

module.exports = router;