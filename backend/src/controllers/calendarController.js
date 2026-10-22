const CalendarEvent = require("../models/calendarEvent");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

// ========================================
// NORMALIZE DATE
// Stores YYYY-MM-DD as UTC midnight
// ========================================

const normalizeDate = (dateInput) => {
    if (!dateInput) {
        return null;
    }

    const dateString = String(dateInput).trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return null;
    }

    const [year, month, day] = dateString
        .split("-")
        .map(Number);

    return new Date(
        Date.UTC(year, month - 1, day)
    );
};

// ========================================
// CREATE CALENDAR EVENT
// Admin only
// ========================================

const createCalendarEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            eventType,
            audienceType,
            targetClass,
            startDate,
            endDate,
            eventTime,
            location
        } = req.body;

        if (
            !title ||
            !eventType ||
            !audienceType ||
            !startDate
        ) {
            return res.status(400).json({
                message:
                    "Title, event type, audience and start date are required"
            });
        }

        const normalizedStartDate =
            normalizeDate(startDate);

        if (!normalizedStartDate) {
            return res.status(400).json({
                message:
                    "Start date must be in YYYY-MM-DD format"
            });
        }

        let normalizedEndDate = null;

        if (endDate) {
            normalizedEndDate =
                normalizeDate(endDate);

            if (!normalizedEndDate) {
                return res.status(400).json({
                    message:
                        "End date must be in YYYY-MM-DD format"
                });
            }

            if (
                normalizedEndDate <
                normalizedStartDate
            ) {
                return res.status(400).json({
                    message:
                        "End date cannot be before start date"
                });
            }
        }

        if (
            audienceType === "class" &&
            (!targetClass ||
                String(targetClass).trim() === "")
        ) {
            return res.status(400).json({
                message:
                    "Target class is required for class events"
            });
        }

        if (
            audienceType !== "class" &&
            targetClass
        ) {
            return res.status(400).json({
                message:
                    "Target class should only be used for class events"
            });
        }

        const event = await CalendarEvent.create({
            title: title.trim(),
            description:
                description?.trim() || "",
            eventType,
            audienceType,
            targetClass:
                audienceType === "class"
                    ? targetClass.trim()
                    : null,
            startDate: normalizedStartDate,
            endDate: normalizedEndDate,
            eventTime:
                eventTime?.trim() || null,
            location:
                location?.trim() || null,
            createdBy: req.user.userId
        });

        return res.status(201).json({
            message:
                "Calendar event created successfully",
            event
        });

    } catch (error) {
        console.error(
            "Create calendar event error:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
};

// ========================================
// GET CALENDAR EVENTS
// Student / Teacher / Admin
// ========================================

const getCalendarEvents = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        let query = {};

        // ========================================
        // ADMIN
        // ========================================

        if (req.user.role === "admin") {
            query = {};
        }

        // ========================================
        // STUDENT
        // ========================================

        else if (req.user.role === "student") {
            const student = await Student.findOne({
                user: req.user.userId
            }).select("standard");

            if (!student) {
                return res.status(404).json({
                    message:
                        "Student profile not found"
                });
            }

            query = {
                $or: [
                    {
                        audienceType: "all"
                    },
                    {
                        audienceType: "students"
                    },
                    {
                        audienceType: "class",
                        targetClass: student.standard
                    }
                ]
            };
        }

        // ========================================
        // TEACHER
        // ========================================

        else if (req.user.role === "teacher") {
            const teacher = await Teacher.findOne({
                user: req.user.userId
            }).select("assignedClasses");

            if (!teacher) {
                return res.status(404).json({
                    message:
                        "Teacher profile not found"
                });
            }

            const assignedClasses =
                teacher.assignedClasses || [];

            query = {
                $or: [
                    {
                        audienceType: "all"
                    },
                    {
                        audienceType: "teachers"
                    },
                    {
                        audienceType: "class",
                        targetClass: {
                            $in: assignedClasses
                        }
                    }
                ]
            };
        }

        else {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const events = await CalendarEvent.find(
            query
        )
            .populate(
                "createdBy",
                "username role"
            )
            .sort({
                startDate: 1
            });

        return res.status(200).json({
            message:
                "Calendar events retrieved successfully",
            events
        });

    } catch (error) {
        console.error(
            "Get calendar events error:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
};

// ========================================
// UPDATE CALENDAR EVENT
// Admin only
// ========================================

const updateCalendarEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            description,
            eventType,
            audienceType,
            targetClass,
            startDate,
            endDate,
            eventTime,
            location
        } = req.body;

        const event =
            await CalendarEvent.findById(id);

        if (!event) {
            return res.status(404).json({
                message: "Calendar event not found"
            });
        }

        if (title !== undefined) {
            event.title = title.trim();
        }

        if (description !== undefined) {
            event.description =
                description.trim();
        }

        if (eventType !== undefined) {
            event.eventType = eventType;
        }

        if (audienceType !== undefined) {
            event.audienceType =
                audienceType;
        }

        if (startDate !== undefined) {
            const normalizedStartDate =
                normalizeDate(startDate);

            if (!normalizedStartDate) {
                return res.status(400).json({
                    message:
                        "Start date must be in YYYY-MM-DD format"
                });
            }

            event.startDate =
                normalizedStartDate;
        }

        if (endDate !== undefined) {
            if (!endDate) {
                event.endDate = null;
            } else {
                const normalizedEndDate =
                    normalizeDate(endDate);

                if (!normalizedEndDate) {
                    return res.status(400).json({
                        message:
                            "End date must be in YYYY-MM-DD format"
                    });
                }

                event.endDate =
                    normalizedEndDate;
            }
        }

        if (eventTime !== undefined) {
            event.eventTime =
                eventTime?.trim() || null;
        }

        if (location !== undefined) {
            event.location =
                location?.trim() || null;
        }

        const finalAudience =
            event.audienceType;

        if (finalAudience === "class") {
            const finalClass =
                targetClass !== undefined
                    ? targetClass
                    : event.targetClass;

            if (
                !finalClass ||
                String(finalClass).trim() === ""
            ) {
                return res.status(400).json({
                    message:
                        "Target class is required for class events"
                });
            }

            event.targetClass =
                String(finalClass).trim();
        } else {
            event.targetClass = null;
        }

        if (
            event.endDate &&
            event.endDate < event.startDate
        ) {
            return res.status(400).json({
                message:
                    "End date cannot be before start date"
            });
        }

        await event.save();

        return res.status(200).json({
            message:
                "Calendar event updated successfully",
            event
        });

    } catch (error) {
        console.error(
            "Update calendar event error:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
};

// ========================================
// DELETE CALENDAR EVENT
// Admin only
// ========================================

const deleteCalendarEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event =
            await CalendarEvent.findById(id);

        if (!event) {
            return res.status(404).json({
                message: "Calendar event not found"
            });
        }

        await event.deleteOne();

        return res.status(200).json({
            message:
                "Calendar event deleted successfully"
        });

    } catch (error) {
        console.error(
            "Delete calendar event error:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    createCalendarEvent,
    getCalendarEvents,
    updateCalendarEvent,
    deleteCalendarEvent
};