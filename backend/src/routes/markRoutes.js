const express = require("express");

const router = express.Router();

const {
    createMark,
    getMarks,
    getMarkById,
    updateMark,
    deleteMark,
    getMyMarks
} = require("../controllers/markController");

const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// ======================================
// CREATE MARK
// Teacher / Admin
// ======================================
router.post(
    "/",
    protect,
    authorizeRoles("teacher", "admin"),
    createMark
);

// ======================================
// GET LOGGED-IN STUDENT'S MARKS
// IMPORTANT: MUST BE BEFORE /:id
// ======================================
router.get(
    "/my",
    protect,
    authorizeRoles("student"),
    getMyMarks
);

// ======================================
// GET ALL MARKS
// Teacher / Admin / Student
// ======================================
router.get(
    "/",
    protect,
    authorizeRoles("teacher", "admin", "student"),
    getMarks
);

// ======================================
// GET ONE MARK BY ID
// ======================================
router.get(
    "/:id",
    protect,
    authorizeRoles("teacher", "admin", "student"),
    getMarkById
);

// ======================================
// UPDATE MARK
// Teacher / Admin
// ======================================
router.put(
    "/:id",
    protect,
    authorizeRoles("teacher", "admin"),
    updateMark
);

// ======================================
// DELETE MARK
// Teacher / Admin
// ======================================
router.delete(
    "/:id",
    protect,
    authorizeRoles("teacher", "admin"),
    deleteMark
);

module.exports = router;