const Teacher = require("../models/teacher");
const Substitution = require("../models/substitution");
const { sendAbsentNotification } = require("../services/notificationService");
const Attendance = require("../models/Attendance");
const Student = require("../models/student");


// ==========================
// HELPER: NORMALIZE DATE
// ==========================
const normalizeDate = (dateInput) => {
    const date = new Date(dateInput);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    // Store only the calendar date
    return new Date(
        Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate()
        )
    );
};


// ==========================
// HELPER: CHECK TEACHER ACCESS
// ==========================
// Checks:
// 1. Admin → always allowed
// 2. Teacher → assigned class
// 3. Substitute teacher → assigned substitution for that date
// ==========================
const checkTeacherAccess = async (
    req,
    student,
    attendanceDate = null
) => {

    // ==========================
    // ADMIN
    // ==========================
    if (req.user.role === "admin") {
        return {
            allowed: true
        };
    }

    // ==========================
    // FIND TEACHER
    // ==========================
    const teacher = await Teacher.findOne({
        user: req.user.userId
    });

    if (!teacher) {
        return {
            allowed: false,
            status: 403,
            message: "Teacher profile not found"
        };
    }

    // ==========================
    // NORMAL TEACHER ACCESS
    // ==========================
    const assignedClasses =
        (teacher.assignedClasses || []).map(
            value =>
                String(value)
                    .trim()
                    .toLowerCase()
        );

    const studentClass =
        String(student.standard)
            .trim()
            .toLowerCase();

    // Teacher normally teaches this class
    if (assignedClasses.includes(studentClass)) {
        return {
            allowed: true,
            teacher,
            accessType: "regular"
        };
    }

    // ==========================
    // SUBSTITUTE ACCESS
    // ==========================
    // No date = this request is not
    // being checked for temporary access.
    if (!attendanceDate) {
        return {
            allowed: false,
            status: 403,
            message:
                `You are not assigned to ${student.standard} class`
        };
    }

    // Find substitutions for this teacher
    // on this exact date
    const substitutions = await Substitution.find({
        substituteTeacher: teacher._id,
        date: attendanceDate
    });

    const validSubstitution =
        substitutions.find(
            substitution =>
                String(substitution.className)
                    .trim()
                    .toLowerCase() === studentClass
        );

    if (validSubstitution) {
        return {
            allowed: true,
            teacher,
            accessType: "substitute",
            substitution: validSubstitution
        };
    }

    // ==========================
    // ACCESS DENIED
    // ==========================
    return {
        allowed: false,
        status: 403,
        message:
            `You are not assigned to ${student.standard} class`
    };
};


// ==========================
// MARK ATTENDANCE
// ==========================
const markAttendance = async (req, res) => {
    try {
        const {
            studentId,
            date,
            status
        } = req.body;

        // Authentication
        if (
            !req.user ||
            !req.user.userId ||
            !req.user.role
        ) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        // Required fields
        if (!studentId || !date || !status) {
            return res.status(400).json({
                message:
                    "Student ID, date and status are required"
            });
        }

        // Status validation
        if (!["present", "absent"].includes(status)) {
            return res.status(400).json({
                message:
                    "Status must be present or absent"
            });
        }

        // Normalize date
        const attendanceDate =
            normalizeDate(date);

        if (!attendanceDate) {
            return res.status(400).json({
                message: "Invalid date"
            });
        }

        // Find student
        const student =
            await Student.findOne({
                studentId:
                    String(studentId).trim()
            });

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Check teacher/admin/substitution access
        const access =
            await checkTeacherAccess(
                req,
                student,
                attendanceDate
            );

        if (!access.allowed) {
            return res.status(
                access.status
            ).json({
                message: access.message
            });
        }

        const markedBy =
            req.user.userId;

        // Check duplicate
        const existingAttendance =
            await Attendance.findOne({
                student: student._id,
                date: attendanceDate
            });

        if (existingAttendance) {
            return res.status(400).json({
                message:
                    "Attendance already marked for this student on this date"
            });
        }

        // Create attendance
        const attendance =
            await Attendance.create({
                student: student._id,
                date: attendanceDate,
                status,
                markedBy
            });

        // ==========================
        // ABSENCE NOTIFICATION
        // ==========================
        let notification = null;

        if (status === "absent") {

            if (student.guardianPhone) {

                notification =
                    await sendAbsentNotification(
                        student.guardianPhone,
                        student.name,
                        attendanceDate
                    );

            } else {

                notification = {
                    success: false,
                    message:
                        "Guardian phone number not available"
                };
            }
        }

        return res.status(201).json({
            message:
                "Attendance marked successfully",

            attendance,

            accessType:
                access.accessType || "admin",

            notification
        });

    } catch (error) {

        console.error(
            "Attendance error:",
            error
        );

        // MongoDB duplicate
        if (error.code === 11000) {
            return res.status(400).json({
                message:
                    "Attendance already marked for this student on this date"
            });
        }

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================
// GET STUDENT ATTENDANCE
// ==========================
const getStudentAttendance = async (
    req,
    res
) => {
    try {

        // Authentication
        if (
            !req.user ||
            !req.user.userId ||
            !req.user.role
        ) {
            return res.status(401).json({
                message:
                    "Authentication required"
            });
        }

        const { studentId } =
            req.params;

        // Find student
        const student =
            await Student.findOne({
                studentId:
                    String(studentId).trim()
            });

        if (!student) {
            return res.status(404).json({
                message:
                    "Student not found"
            });
        }

        // For viewing attendance,
        // normal assigned-class access applies.
        // Temporary substitution is specifically
        // for marking attendance on its assigned date.
        const access =
            await checkTeacherAccess(
                req,
                student
            );

        if (!access.allowed) {
            return res.status(
                access.status
            ).json({
                message: access.message
            });
        }

        // Get attendance
        const attendance =
            await Attendance.find({
                student: student._id
            })
                .sort({ date: -1 })
                .populate(
                    "markedBy",
                    "username role"
                );

        return res.status(200).json({
            message:
                "Attendance retrieved successfully",

            studentId:
                student.studentId,

            count:
                attendance.length,

            attendance
        });

    } catch (error) {

        console.error(
            "Get attendance error:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================
// GET MY ATTENDANCE
// ==========================
const getMyAttendance = async (
    req,
    res
) => {
    try {

        // Authentication
        if (
            !req.user ||
            !req.user.userId
        ) {
            return res.status(401).json({
                message:
                    "Authentication required"
            });
        }

        // Find student linked to user
        const student =
            await Student.findOne({
                user: req.user.userId
            });

        if (!student) {
            return res.status(404).json({
                message:
                    "Student profile not found"
            });
        }

        // Get attendance
        const attendance =
            await Attendance.find({
                student: student._id
            })
                .sort({ date: -1 });

        // Statistics
        const totalDays =
            attendance.length;

        const presentDays =
            attendance.filter(
                record =>
                    record.status === "present"
            ).length;

        const absentDays =
            attendance.filter(
                record =>
                    record.status === "absent"
            ).length;

        const attendancePercentage =
            totalDays === 0
                ? 0
                : Number(
                    (
                        (presentDays /
                            totalDays) *
                        100
                    ).toFixed(2)
                );

        return res.status(200).json({
            message:
                "Student attendance retrieved successfully",

            student: {
                studentId:
                    student.studentId,

                name:
                    student.name,

                standard:
                    student.standard,

                rollNumber:
                    student.rollNumber
            },

            summary: {
                totalDays,
                presentDays,
                absentDays,
                attendancePercentage
            },

            attendance
        });

    } catch (error) {

        console.error(
            "My attendance error:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================
// MARK BULK ATTENDANCE
// ==========================
const markBulkAttendance = async (
    req,
    res
) => {
    try {

        const {
            date,
            attendance
        } = req.body;

        // Authentication
        if (
            !req.user ||
            !req.user.userId ||
            !req.user.role
        ) {
            return res.status(401).json({
                message:
                    "Authentication required"
            });
        }

        // Validate request
        if (
            !date ||
            !Array.isArray(attendance) ||
            attendance.length === 0
        ) {
            return res.status(400).json({
                message:
                    "Date and attendance data are required"
            });
        }

        // Normalize date
        const attendanceDate =
            normalizeDate(date);

        if (!attendanceDate) {
            return res.status(400).json({
                message: "Invalid date"
            });
        }

        const markedBy =
            req.user.userId;

        // =====================================
        // STEP 1: VALIDATE EVERYTHING
        // =====================================

        const preparedRecords = [];

        const studentIdsSeen =
            new Set();

        for (const record of attendance) {

            const {
                studentId,
                status
            } = record;

            // Required fields
            if (!studentId || !status) {
                return res.status(400).json({
                    message:
                        "Student ID and status are required"
                });
            }

            // Status
            if (
                !["present", "absent"]
                    .includes(status)
            ) {
                return res.status(400).json({
                    message:
                        "Status must be present or absent"
                });
            }

            const cleanStudentId =
                String(studentId).trim();

            // Duplicate in request
            if (
                studentIdsSeen.has(
                    cleanStudentId
                )
            ) {
                return res.status(400).json({
                    message:
                        `Duplicate student ${cleanStudentId} in request`
                });
            }

            studentIdsSeen.add(
                cleanStudentId
            );

            // Find student
            const student =
                await Student.findOne({
                    studentId:
                        cleanStudentId
                });

            if (!student) {
                return res.status(404).json({
                    message:
                        `Student ${cleanStudentId} not found`
                });
            }

            // Check teacher/admin/substitution access
            const access =
                await checkTeacherAccess(
                    req,
                    student,
                    attendanceDate
                );

            if (!access.allowed) {
                return res.status(
                    access.status
                ).json({
                    message:
                        `${cleanStudentId}: ${access.message}`
                });
            }

            // Check duplicate attendance
            const existingAttendance =
                await Attendance.findOne({
                    student: student._id,
                    date: attendanceDate
                });

            if (existingAttendance) {
                return res.status(400).json({
                    message:
                        `Attendance already marked for ${cleanStudentId}`
                });
            }

            preparedRecords.push({
                student:
                    student._id,

                studentId:
                    cleanStudentId,

                name:
                    student.name,

                guardianPhone:
                    student.guardianPhone,

                status,

                date:
                    attendanceDate,

                markedBy
            });
        }

        // =====================================
        // STEP 2: SAVE ALL RECORDS
        // =====================================

        const documentsToInsert =
            preparedRecords.map(
                record => ({
                    student:
                        record.student,

                    date:
                        record.date,

                    status:
                        record.status,

                    markedBy:
                        record.markedBy
                })
            );

        let savedAttendance;

        try {

            savedAttendance =
                await Attendance.insertMany(
                    documentsToInsert,
                    {
                        ordered: true
                    }
                );

        } catch (error) {

            if (error.code === 11000) {
                return res.status(400).json({
                    message:
                        "One or more attendance records already exist"
                });
            }

            throw error;
        }

        // =====================================
        // STEP 3: NOTIFICATIONS
        // =====================================
        // SMS/notification system will be
        // implemented later.

        return res.status(201).json({
            message:
                "Attendance saved successfully",

            count:
                savedAttendance.length,

            attendance:
                savedAttendance
        });

    } catch (error) {

        console.error(
            "Bulk attendance error:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================
// EXPORT
// ==========================
module.exports = {
    markAttendance,
    markBulkAttendance,
    getStudentAttendance,
    getMyAttendance
};