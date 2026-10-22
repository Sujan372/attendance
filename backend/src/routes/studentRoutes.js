const express = require("express");

const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getStudentDashboard
} = require("../controllers/studentController");

const router = express.Router();


// ==========================
// ADMIN - Create student
// ==========================

router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    createStudent
);


// ==========================
// STUDENT - Dashboard
// IMPORTANT: Keep before /:studentId
// ==========================

router.get(
    "/dashboard",
    protect,
    authorizeRoles("student"),
    getStudentDashboard
);


// ==========================
// ADMIN / TEACHER - Get all students
// ==========================

router.get(
    "/",
    protect,
    authorizeRoles("admin", "teacher"),
    getAllStudents
);


// ==========================
// ADMIN / TEACHER - Get student by ID
// ==========================

router.get(
    "/:studentId",
    protect,
    authorizeRoles("admin", "teacher"),
    getStudentById
);


// ==========================
// ADMIN / TEACHER - Update student
// ==========================

router.put(
    "/:studentId",
    protect,
    authorizeRoles("admin", "teacher"),
    updateStudent
);


// ==========================
// ADMIN - Delete student
// ==========================

router.delete(
    "/:studentId",
    protect,
    authorizeRoles("admin"),
    deleteStudent
);


module.exports = router;