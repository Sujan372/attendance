const mongoose = require("mongoose");

const Student = require("../models/Student");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Mark = require("../models/Mark");
const Complaint = require("../models/Complaint");
const bcrypt = require("bcryptjs");

// ======================================
// CREATE STUDENT + USER ACCOUNT
// Admin only
// ======================================
const createStudent = async (req, res) => {
    try {
        const {
            username,
            password,
            studentId,
            name,
            standard,
            rollNumber,
            academicYear,
            guardianName,
            guardianPhone
        } = req.body;

        // ======================================
        // VALIDATE REQUIRED FIELDS
        // ======================================

        if (
            !username ||
            !password ||
            !studentId ||
            !name ||
            !standard ||
            rollNumber === undefined ||
            !academicYear ||
            !guardianName ||
            !guardianPhone
        ) {
            return res.status(400).json({
                message:
                    "Username, password and all student fields are required"
            });
        }

        // ======================================
        // VALIDATE ROLL NUMBER
        // ======================================

        if (Number(rollNumber) <= 0) {
            return res.status(400).json({
                message:
                    "Roll number must be greater than zero"
            });
        }

        // ======================================
        // CHECK EXISTING USER
        // ======================================

        const existingUser = await User.findOne({
            username: username.trim()
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Username already exists"
            });
        }

        // ======================================
        // CHECK EXISTING STUDENT
        // ======================================

        const existingStudent = await Student.findOne({
            studentId: studentId.trim()
        });

        if (existingStudent) {
            return res.status(400).json({
                message: "Student ID already exists"
            });
        }

        // ======================================
        // HASH PASSWORD
        // ======================================

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // ======================================
        // CREATE USER
        // ======================================

        const user = await User.create({
            username: username.trim(),
            password: hashedPassword,
            role: "student",

            // Admin-created accounts can login immediately.
            isVerified: true
        });

        try {

            // ======================================
            // CREATE STUDENT
            // ======================================

            const student = await Student.create({
                studentId: studentId.trim(),
                name: name.trim(),
                standard: standard.trim(),
                rollNumber: Number(rollNumber),
                academicYear: academicYear.trim(),
                guardianName: guardianName.trim(),
                guardianPhone: guardianPhone.trim(),
                user: user._id
            });

            return res.status(201).json({
                message:
                    "Student account and profile created successfully",

                student: {
                    id: student._id,
                    studentId: student.studentId,
                    name: student.name,
                    standard: student.standard,
                    rollNumber: student.rollNumber,
                    academicYear: student.academicYear,
                    guardianName: student.guardianName,
                    guardianPhone: student.guardianPhone
                },

                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role,
                    isVerified: user.isVerified
                }
            });

        } catch (studentError) {

            // ======================================
            // ROLLBACK USER IF STUDENT CREATION FAILS
            // ======================================

            await User.findByIdAndDelete(user._id);

            throw studentError;
        }

    } catch (error) {
        console.error(
            "Create student error:",
            error
        );

        // Handle duplicate MongoDB key errors
        if (error.code === 11000) {
            return res.status(400).json({
                message:
                    "Username or student ID already exists"
            });
        }

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ======================================
// GET ALL STUDENTS
// ======================================
const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find()
            .populate(
                "user",
                "username role isVerified"
            )
            .sort({
                standard: 1,
                rollNumber: 1
            });

        res.status(200).json({
            message:
                "Students retrieved successfully",
            count: students.length,
            students
        });

    } catch (error) {
        console.error(
            "Get all students error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ======================================
// GET STUDENT BY STUDENT ID
// ======================================
const getStudentById = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findOne({
            studentId
        }).populate(
            "user",
            "username role isVerified"
        );

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json({
            message:
                "Student retrieved successfully",
            student
        });

    } catch (error) {
        console.error(
            "Get student error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ======================================
// UPDATE STUDENT
// ======================================
const updateStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const {
            name,
            standard,
            rollNumber,
            academicYear,
            guardianName,
            guardianPhone
        } = req.body;

        const updateData = {};

        if (name !== undefined) {
            updateData.name = name.trim();
        }

        if (standard !== undefined) {
            updateData.standard = standard.trim();
        }

        if (rollNumber !== undefined) {
            if (Number(rollNumber) <= 0) {
                return res.status(400).json({
                    message:
                        "Roll number must be greater than zero"
                });
            }

            updateData.rollNumber = Number(
                rollNumber
            );
        }

        if (academicYear !== undefined) {
            updateData.academicYear =
                academicYear.trim();
        }

        if (guardianName !== undefined) {
            updateData.guardianName =
                guardianName.trim();
        }

        if (guardianPhone !== undefined) {
            updateData.guardianPhone =
                guardianPhone.trim();
        }

        const student =
            await Student.findOneAndUpdate(
                { studentId },
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            ).populate(
                "user",
                "username role isVerified"
            );

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json({
            message:
                "Student updated successfully",
            student
        });

    } catch (error) {
        console.error(
            "Update student error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ======================================
// DELETE STUDENT
// ======================================
const deleteStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student =
            await Student.findOne({
                studentId
            });

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Delete student profile
        await Student.deleteOne({
            _id: student._id
        });

        // Delete linked login account
        if (student.user) {
            await User.findByIdAndDelete(
                student.user
            );
        }

        res.status(200).json({
            message:
                "Student and login account deleted successfully"
        });

    } catch (error) {
        console.error(
            "Delete student error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ======================================
// STUDENT DASHBOARD
// Logged-in student only
// ======================================
const getStudentDashboard = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                message:
                    "Authentication required"
            });
        }

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

        // ======================================
        // ATTENDANCE
        // ======================================

        const attendance =
            await Attendance.find({
                student: student._id
            });

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

        // ======================================
        // MARKS
        // ======================================

        const marks =
            await Mark.find({
                student: student._id
            });

        const totalMarks =
            marks.reduce(
                (sum, mark) =>
                    sum +
                    Number(
                        mark.totalMarks || 0
                    ),
                0
            );

        const marksObtained =
            marks.reduce(
                (sum, mark) =>
                    sum +
                    Number(
                        mark.marksObtained || 0
                    ),
                0
            );

        const marksPercentage =
            totalMarks === 0
                ? 0
                : Number(
                    (
                        (marksObtained /
                            totalMarks) *
                        100
                    ).toFixed(2)
                );

        // ======================================
        // RECENT COMPLAINTS
        // ======================================

        const complaints =
            await Complaint.find({
                student: student._id
            })
                .sort({
                    createdAt: -1
                })
                .limit(5)
                .populate(
                    "teacher",
                    "teacherId name"
                );

        // ======================================
        // RESPONSE
        // ======================================

        res.status(200).json({
            message:
                "Student dashboard retrieved successfully",

            student: {
                studentId:
                    student.studentId,
                name:
                    student.name,
                standard:
                    student.standard,
                rollNumber:
                    student.rollNumber,
                academicYear:
                    student.academicYear
            },

            attendance: {
                totalDays,
                presentDays,
                absentDays,
                percentage:
                    attendancePercentage
            },

            marks: {
                subjects:
                    marks.length,
                marksObtained,
                totalMarks,
                percentage:
                    marksPercentage
            },

            recentComplaints:
                complaints
        });

    } catch (error) {
        console.error(
            "Student dashboard error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ======================================
// EXPORTS
// ======================================

module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getStudentDashboard
};