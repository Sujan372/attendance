const express = require("express");

const router = express.Router();

const {
    createComplaint,
    getComplaints,
    getMyComplaints,
    getComplaintById,
    updateComplaint,
    deleteComplaint
} = require("../controllers/complaintController");

const protect = require("../middleware/authMiddleware");

const {
    authorizeRoles
} = require("../middleware/roleMiddleware");


// ==========================
// CREATE COMPLAINT
// Teacher/Admin
// ==========================

router.post(
    "/",
    protect,
    authorizeRoles("teacher", "admin"),
    createComplaint
);


// ==========================
// GET ALL COMPLAINTS
// Teacher/Admin
// ==========================

router.get(
    "/",
    protect,
    authorizeRoles("teacher", "admin"),
    getComplaints
);


// ==========================
// GET LOGGED-IN STUDENT'S COMPLAINTS
// Student
// IMPORTANT: Must come before /:id
// ==========================

router.get(
    "/my",
    protect,
    authorizeRoles("student"),
    getMyComplaints
);


// ==========================
// GET ONE COMPLAINT
// Teacher/Admin
// ==========================

router.get(
    "/:id",
    protect,
    authorizeRoles("teacher", "admin"),
    getComplaintById
);


// ==========================
// UPDATE COMPLAINT
// Admin only
// ==========================

router.put(
    "/:id",
    protect,
    authorizeRoles("admin"),
    updateComplaint
);


// ==========================
// DELETE COMPLAINT
// Admin only
// ==========================

router.delete(
    "/:id",
    protect,
    authorizeRoles("admin"),
    deleteComplaint
);


module.exports = router;