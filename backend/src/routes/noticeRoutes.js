const express = require("express");

const protect =
    require("../middleware/authMiddleware");

const {
    authorizeRoles
} = require("../middleware/roleMiddleware");

const {
    createNotice,
    getAllNotices,
    getTeacherNotices,
    getMyNotices,
    deleteNotice
} = require("../controllers/noticeController");

const router = express.Router();


// ========================================
// CREATE NOTICE
// ADMIN + TEACHER
// ========================================

router.post(
    "/",
    protect,
    authorizeRoles("admin", "teacher"),
    createNotice
);


// ========================================
// ADMIN → ALL NOTICES
// ========================================

router.get(
    "/",
    protect,
    authorizeRoles("admin"),
    getAllNotices
);


// ========================================
// TEACHER → THEIR RELEVANT NOTICES
// ========================================

router.get(
    "/teacher",
    protect,
    authorizeRoles("teacher"),
    getTeacherNotices
);


// ========================================
// STUDENT → THEIR NOTICES
// ========================================

router.get(
    "/my",
    protect,
    authorizeRoles("student"),
    getMyNotices
);


// ========================================
// DELETE
// ADMIN ONLY
// ========================================

router.delete(
    "/:id",
    protect,
    authorizeRoles("admin"),
    deleteNotice
);


module.exports = router;