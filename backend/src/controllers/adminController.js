const Student = require("../models/student");
const Teacher = require("../models/Teacher");
const Attendance = require("../models/Attendance");
const Mark = require("../models/mark");
const Complaint = require("../models/complaint");

// ========================================
// ADMIN DASHBOARD STATISTICS
// ========================================

const getDashboardStats = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const totalTeachers = await Teacher.countDocuments();

        // Get today's date range
        const today = new Date();

        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const todayAttendance = await Attendance.countDocuments({
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        const pendingComplaints =
            await Complaint.countDocuments({
                status: "Pending"
            });

        res.status(200).json({
            message: "Admin dashboard statistics retrieved successfully",

            statistics: {
                totalStudents,
                totalTeachers,
                todayAttendance,
                pendingComplaints
            }
        });

    } catch (error) {
        console.error(
            "Admin dashboard error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ========================================
// GET ALL STUDENTS
// ========================================

const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find()
            .select(
                "studentId name standard rollNumber academicYear guardianName guardianPhone createdAt"
            )
            .sort({
                standard: 1,
                rollNumber: 1
            });

        res.status(200).json({
            message: "Students retrieved successfully",
            count: students.length,
            students
        });

    } catch (error) {
        console.error(
            "Admin get students error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ========================================
// GET ALL TEACHERS
// ========================================

const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find()
            .select(
                "teacherId name phone email subjects assignedClasses createdAt"
            )
            .sort({
                name: 1
            });

        res.status(200).json({
            message: "Teachers retrieved successfully",
            count: teachers.length,
            teachers
        });

    } catch (error) {
        console.error(
            "Admin get teachers error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ========================================
// GET ALL ATTENDANCE
// ========================================

const getAllAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find()
            .populate(
                "student",
                "studentId name standard"
            )
            .populate(
                "markedBy",
                "username role"
            )
            .sort({
                date: -1
            });

        res.status(200).json({
            message: "Attendance records retrieved successfully",
            count: attendance.length,
            attendance
        });

    } catch (error) {
        console.error(
            "Admin get attendance error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ========================================
// GET ALL MARKS
// ========================================

const getAllMarks = async (req, res) => {
    try {
        const marks = await Mark.find()
            .populate(
                "student",
                "studentId name standard"
            )
            .populate(
                "teacher",
                "teacherId name"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            message: "Marks retrieved successfully",
            count: marks.length,
            marks
        });

    } catch (error) {
        console.error(
            "Admin get marks error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ========================================
// GET ALL COMPLAINTS
// ========================================

const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate(
                "student",
                "studentId name standard"
            )
            .populate(
                "teacher",
                "teacherId name"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            message: "Complaints retrieved successfully",
            count: complaints.length,
            complaints
        });

    } catch (error) {
        console.error(
            "Admin get complaints error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ========================================
// EXPORTS
// ========================================

module.exports = {
    getDashboardStats,
    getAllStudents,
    getAllTeachers,
    getAllAttendance,
    getAllMarks,
    getAllComplaints
};