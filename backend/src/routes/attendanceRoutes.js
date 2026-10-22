const express = require("express");

const router = express.Router();

const {
    markAttendance,
    markBulkAttendance,
    getStudentAttendance,
    getMyAttendance
} = require("../controllers/attendanceController");

const protect = require("../middleware/authMiddleware");

const { authorizeRoles } = require("../middleware/roleMiddleware");

// ========================================
// MARK ATTENDANCE - SINGLE STUDENT
// ========================================
router.post(
    "/",
    protect,
    authorizeRoles("teacher", "admin"),
    markAttendance
);

// ========================================
// MARK ATTENDANCE - ENTIRE CLASS
// ========================================
router.post(
    "/bulk",
    protect,
    authorizeRoles("teacher", "admin"),
    markBulkAttendance
);

// ========================================
// LOGGED-IN STUDENT ATTENDANCE
// ========================================
router.get(
    "/my",
    protect,
    authorizeRoles("student"),
    getMyAttendance
);

// ========================================
// GET ATTENDANCE BY STUDENT ID
// ========================================
router.get(
    "/:studentId",
    protect,
    authorizeRoles("teacher", "admin"),
    getStudentAttendance
);

module.exports = router;