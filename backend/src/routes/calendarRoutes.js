const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    authorizeRoles
} = require("../middleware/roleMiddleware");

const {
    createCalendarEvent,
    getCalendarEvents,
    updateCalendarEvent,
    deleteCalendarEvent
} = require("../controllers/calendarController");

const router = express.Router();

// ========================================
// VIEW CALENDAR
// ========================================

router.get(
    "/",
    protect,
    authorizeRoles(
        "admin",
        "teacher",
        "student"
    ),
    getCalendarEvents
);

// ========================================
// CREATE EVENT
// ADMIN ONLY
// ========================================

router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    createCalendarEvent
);

// ========================================
// UPDATE EVENT
// ADMIN ONLY
// ========================================

router.put(
    "/:id",
    protect,
    authorizeRoles("admin"),
    updateCalendarEvent
);

// ========================================
// DELETE EVENT
// ADMIN ONLY
// ========================================

router.delete(
    "/:id",
    protect,
    authorizeRoles("admin"),
    deleteCalendarEvent
);

module.exports = router;