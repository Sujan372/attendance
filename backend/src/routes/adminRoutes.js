const express = require("express");

const router = express.Router();

const {
    getDashboardStats,
    getAllStudents,
    getAllTeachers,
    getAllAttendance,
    getAllMarks,
    getAllComplaints
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");

const {
    authorizeRoles
} = require("../middleware/roleMiddleware");


// ========================================
// ADMIN DASHBOARD
// ========================================

router.get(
    "/dashboard",
    protect,
    authorizeRoles("admin"),
    getDashboardStats
);


// ========================================
// ALL STUDENTS
// ========================================

router.get(
    "/students",
    protect,
    authorizeRoles("admin"),
    getAllStudents
);


// ========================================
// ALL TEACHERS
// ========================================

router.get(
    "/teachers",
    protect,
    authorizeRoles("admin"),
    getAllTeachers
);


// ========================================
// ALL ATTENDANCE
// ========================================

router.get(
    "/attendance",
    protect,
    authorizeRoles("admin"),
    getAllAttendance
);


// ========================================
// ALL MARKS
// ========================================

router.get(
    "/marks",
    protect,
    authorizeRoles("admin"),
    getAllMarks
);


// ========================================
// ALL COMPLAINTS
// ========================================

router.get(
    "/complaints",
    protect,
    authorizeRoles("admin"),
    getAllComplaints
);


module.exports = router;